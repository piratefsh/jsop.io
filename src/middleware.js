'use strict';
const fs = require('fs');

// attach middleware (e.g., redis, sessions, logging, error handling)
module.exports = (app, cfg) => {

  // prepare quick storage (redis) connection, if available
  const redis = cfg.redisURI && new (require('ioredis'))(cfg.redisURI);
  app.locals.redis = redis;

  // attach session middleware (uses redis)
  const session = require('express-session');
  app.use(session({
    secret:             cfg.sessKey,
    resave:             false,
    saveUninitialized:  false,
    name:               'jsop-session',
    cookie:             {secure: true},

    store:              redis && // use redis storage, if available
                        new (require('connect-redis')(session))({
                          client: redis // re-use existing client
                        })
  }));

  // auto-parse JSON request bodies
  app.use((req, res, next) => {

    // do nothing for non-json or empty bodies
    if ((req.is('json') && Boolean(req.body)) == false) {
      return next();
    }

    // do json parsing
    try { req.json = JSON.parse(req.body); }
    catch (e) { req.json = {}; }

    return next();
  });

  // autoload benchmark test spec for ":benchspec" param
  app.param('benchspec', (req, res, next, benchspec) => {
    const redis = req.app.locals.redis || false;
    req.benchspec = false; // set default property

    // if available, load benchmark from redis
    if (redis) {

      // todo...
    }

    // if available, lookup from S3
    // if (s3) {
    // todo...
    // }

    // lookup from local file cache
    fs.readFile(
      'cache/tests/' + benchspec + '.json',
      'utf8',
      (err, data) => {

        if (err) {
          // todo: err handling
          return next();
        }

        try { data = JSON.parse(data); }
        catch (e) { data = false; }

        if (data) {
          req.benchspec = data;
        }

        return next();
      }
    );
  });

  // log request metadata
  app.use((req, res, next) => {
    const ref = req.get('referer') || false;

    if (ref) {
      const url = req.originalUrl;

      // todo: logging
    }

    next();
  });
};
