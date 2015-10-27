/**
 * server.js
 *
 * Initializes jsop web server. Available environment configs:
 *
 *  JSOP_PORT         (optional, default: "3000")
 *                    HTTP port for jsop web server.
 *
 *  JSOP_HTTPS        (optional, default: "", ex: "true")
 *                    Flag for indicating HTTPS is enabled.
 *                    Requires SSL proxy layer (i.e., nginx).
 *
 *  JSOP_REDIS_URI    (optional, ex: "redis://user:pass@host:port")
 *                    URI for Redis instance. If not set, mock storage is used.
 *
 *  JSOP_SESS_KEY     (optional, ex: "ABCDEF123456789")
 *                    Key for protecting user session data.
 *
 */

// load environment configs
var cfg = {
  port:       parseInt(process.env.JSOP_PORT) || 3000,
  https:      Boolean(process.env.JSOP_HTTPS),
  redisURI:   process.env.JSOP_REDIS_URI || '',
  sessKey:    process.env.JSOP_SESS_KEY || 'keyboard_cat'
};

// prepare web server (express)
var express = require('express');
var app = express();

// set web server port
app.listen(cfg.port);

// allow HTTPS proxy
app.set('trust proxy', cfg.https);

// attach sub-applications
app.use(express.static('static'));                      // static page asssets
app.use('/api/runtime',   require('./api/runtime'));    // api: runtime stats
app.use('/api/user',      require('./api/user'));       // api: auth management
app.use('/api/benchmark', require('./api/benchmark'));  // api: manage tests
app.use('/api/explore',   require('./api/explore'));    // api: showcase tests

// prepare storage (redis) connection
app.locals.redis = cfg.redisURI ?                   // storage type based on
  require('redis').createClient(cfg.redisURI) :     //  - prod: actual redis
  require('redis-mock').createClient();             //  - dev:  mock redis

// prepare session middleware (relies on redis)
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
app.use(session({
  secret:             cfg.sessKey,
  resave:             false,
  saveUninitialized:  false,
  store:              new RedisStore({client: app.locals.redis}),
  cookie:             {secure: cfg.https}
}));
