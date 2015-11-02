/**
 * Initializes jsop web server from CLI.
 *
 * Available environment configs:
 *
 *  JSOP_SSL_CERT     (optional, default: "insecure.cert")
 *  JSOP_SSL_KEY      (optional, default: "insecure.key")
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

 *  JSOP_OAUTH_GH_ID  (optional, ex: "ABCDEF123456789")
 *  JSOP_OAUTH_GH_SCR (optional, ex: "ABCDEF123456789")
 *                    OAuth Client ID and Secret for user authentication.
 *
 */
'use strict';

// initialize a new jsop instance,
// based on environment configs
const jsop = require('./src/jsop')({
  sslCert:    process.env.JSOP_SSL_CERT,
  sslKey:     process.env.JSOP_SSL_KEY,
  listenPort: parseInt(process.env.JSOP_LISTENPORT),
  trustProxy: Boolean(process.env.JSOP_TRUSTPROXY),
  redisURI:   process.env.JSOP_REDIS_URI,
  sessKey:    process.env.JSOP_SESS_KEY,
  oAuthGHID:  process.env.JSOP_OAUTH_GH_ID,
  oAuthGHScr: process.env.JSOP_OAUTH_GH_SCR
});

// if not loaded as a module, automatically start server with HTTPS
// note: this uses insecure, self-signed SSL by default!
if (Boolean(module.parent) == false) {

  // start listening on configured port
  jsop.server.listen(jsop.app.locals.cfg.listenPort, () => console.log(
    'yay! jsop.io is listening: https://127.0.0.1:' + jsop.server.address().port
  ));
}
