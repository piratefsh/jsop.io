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

  // setup config defaults
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
      githubSecret: config.oAuthGHScr  || ''
    }
  };

  // prepare express web server
  const app = require('express')();
  app.set('trust proxy', cfg.trustProxy);
  app.enable('strict routing');
  app.disable('x-powered-by');

  app.locals.cfg = cfg; // save runtime config
  app.locals.redis = cfg.redisURI && // redis connection, if available
                     new (require('ioredis'))(cfg.redisURI);

  // attach middleware
  const middleware = require('./middleware')(app);
  app.use(middleware.session);
  app.use(middleware.json);
  app.use(middleware.logger);
  app.use(middleware.static);
  app.use(middleware.helpers);

  // attach routers
  app.param('bspec', (req, res, next, bspec) => req.loadBspec(bspec, next));
  app.use('/run/:bspec?',           require('./runner'));
  app.use('/api/benchmark/:bspec?', require('./api/benchmark'));
  app.use('/api/user',              require('./api/user'));

  // attach final, catch-all middleware
  app.use('/*', (req, res) => {
    console.log('catch-all-here');
    res.headersSent || res.sendNotFound();
  });
  app.use((err, req, res, next) => {
    console.log('error-handler-here');
    res.sendError(err, false);
  });

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
