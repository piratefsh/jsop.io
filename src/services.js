'use strict';

// attach persistent services
// (i.e., db, redis, sessions)
module.exports = (app, cfg) => {

  // todo: prepare hard db storage (mysql) connection
  // app.locals.db = cfg.mysqlURI

  // prepare quick storage (redis) connection
  app.locals.redis = cfg.redisURI ?
    require('redis').createClient(cfg.redisURI) :
    require('redis-mock').createClient();

  // attach related redis helpers
  // app.locals.models = models;

  // prepare user session storage (relies on redis)
  const session = require('express-session');
  app.use(session({
    secret:             cfg.sessKey,
    resave:             false,
    saveUninitialized:  false,
    name:               'jsop-session',
    cookie:             {secure: true},

    store:              cfg.redisURI && // use redis, if enabled
                        new (require('connect-redis')(session))({
                          client: app.locals.redis
                        })
  }));
};
