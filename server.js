/**
 * server.js
 *
 * Initializes jsop web server. Available environment configs:
 *
 *  JSOP_SSL_CERT     (optional, default: "src/insecure.cert")
 *  JSOP_SSL_KEY      (optional, default: "src/insecure.key")
 *                    SSL certs for HTTPS configuration. Insecure
 *                    self-signed certs are provided by default.
 *
 *  JSOP_LISTENPORT   (optional, default: "8443")
 *                    HTTP port for jsop web server.
 *
 *  JSOP_TRUSTPROXY  (optional, default: "", ex: "1")
 *                    Flag for indicating HTTPS is enabled.
 *                    Requires SSL proxy layer (i.e., nginx).
 *
 *  JSOP_REDIS_URI    (optional, ex: "redis://user:pass@host:port")
 *                    URI for Redis instance. If not set, in-memory
 *                    mock storage is used instead.
 *
 *  JSOP_SESS_KEY     (optional, ex: "ABCDEF123456789")
 *                    Private key for protecting user session data.
 *
 */
'use strict';

// load environment configs
const cfg = {
  sslCert:    process.env.JSOP_SSL_CERT || 'src/insecure.cert',
  sslKey:     process.env.JSOP_SSL_KEY || 'src/insecure.key',
  listenPort: parseInt(process.env.JSOP_LISTENPORT) || 8443,
  trustProxy: Boolean(process.env.JSOP_TRUSTPROXY),
  redisURI:   process.env.JSOP_REDIS_URI || '',
  sessKey:    process.env.JSOP_SESS_KEY || 'keyboard_cat'
};

// prepare web server (express)
const express = require('express');
const app = express();
app.locals.cfg = cfg;                   // store configs
app.set('trust proxy', cfg.trustProxy); // trust proxy headers
app.disable('x-powered-by');            // disable extra header

// attach services (e.g., redis storage, user sessions)
require('./src/services')(app, cfg);

// attach middleware (e.g., logging, error handling)
require('./src/middleware')(app, cfg);

// attach sub-applications
app.use(express.static('static'));                      // static page asssets
app.use('/run',           require('./src/run'));        // serve benchmark tests
app.use('/api/uptime',    require('./src/api/uptime')); // api: server stats
app.use('/api/user',      require('./src/api/user'));   // api: auth management
app.use('/api/test',      require('./src/api/test'));   // api: manage tests
app.use('/api/explore',   require('./src/api/explore'));// api: showcase tests

// load SSL cert/key for HTTPS
const fs = require('fs');
const sslConfig = {
  key: fs.readFileSync(cfg.sslKey),
  cert: fs.readFileSync(cfg.sslCert)
};

// create HTTPS server, and include express app
const server = require('https').createServer(sslConfig, app);

// if not loaded as a module, automatically start server with HTTPS
// note: this uses an insecure self-signed SSL cert by default!
if (Boolean(module.parent) == false) {

  // start listening on configured port
  server.listen(cfg.listenPort, () => console.log(
    'yay! jsop.io is listening: https://127.0.0.1:' + server.address().port
  ));
}

// export as modules (useful for testing)
module.exports.app = app;
module.exports.server = server;
