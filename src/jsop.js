/**
 * jsop web server factory. Returns:
 * `{app: <Express>, server: <https.Server>}`.
 *
 * Available config properties:
 *
 *  sslCert           (optional, default: "insecure.cert")
 *  sslKey            (optional, default: "insecure.key")
 *                    SSL certs for HTTPS configuration. Insecure
 *                    self-signed certs are provided by default.
 *
 *  listenPort        (optional, default: "8443")
 *                    HTTP port for jsop web server.
 *
 *  trustProxy        (optional, default: "", ex: "1")
 *                    Flag for indicating HTTPS is enabled.
 *                    Requires SSL proxy layer (i.e., nginx).
 *
 *  redisURI          (optional, ex: "redis://user:pass@host:port")
 *                    URI for Redis instance. If not set, in-memory
 *                    mock storage is used instead.
 *
 *  sessKey           (optional, ex: "ABCDEF123456789")
 *                    Private key for protecting user session data.

 *  oAuthGHID         (optional, ex: "ABCDEF123456789")
 *  oAuthGHScr        (optional, ex: "ABCDEF123456789")
 *                    OAuth Client ID and Secret for user authentication.
 *
 *
 */
module.exports = config => {

  // setup default config
  config = config || {};
  const cfg = {
    sslCert:    config.sslCert    || 'insecure.cert',
    sslKey:     config.sslKey     || 'insecure.key',
    listenPort: config.listenPort || 8443,
    trustProxy: config.trustProxy || false,
    redisURI:   config.redisURI   || '',
    sessKey:    config.sessKey    || 'keyboard_cat',
    oauth: {
      githubID:     config.oAuthGHID  || '',
      githubSecret: config.oAuthGHSrc  || ''
    }
  };

  // prepare web server (express)
  const express = require('express');
  const app = express();
  app.locals.cfg = cfg;
  app.set('trust proxy', cfg.trustProxy);
  app.enable('strict routing');
  app.disable('x-powered-by');

  // attach middleware
  require('./middleware')(app, cfg);

  // attach sub-applications
  app.use(express.static('static'));                      // static page asssets
  app.use('/run',           require('./run'));        // serve benchmark tests
  app.use('/api/uptime',    require('./api/uptime')); // api: server stats
  app.use('/api/user',      require('./api/user'));   // api: auth management
  app.use('/api/test',      require('./api/test'));   // api: manage tests
  app.use('/api/explore',   require('./api/explore'));// api: showcase tests

  // load SSL cert/key for HTTPS
  const fs = require('fs');
  const sslConfig = {
    key: fs.readFileSync(cfg.sslKey),
    cert: fs.readFileSync(cfg.sslCert)
  };

  // create HTTPS server, and include express app
  const server = require('https').createServer(sslConfig, app);

  return {app: app, server: server};
};
