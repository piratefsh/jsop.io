'use strict';
const fs = require('fs');
const session = require('express-session');

module.exports = app => ({

  // client session middleware
  session: session({
    secret:             app.locals.cfg.sessKey,
    resave:             false,
    saveUninitialized:  false,
    name:               'jsop-session',
    cookie:             {secure: true},

    store:              app.locals.redis && // use redis storage, if available
                        new (require('connect-redis')(session))({
                          client: app.locals.redis // re-use existing client
                        })
  }),

  // auto-parse JSON request bodies
  json: (req, res, next) => {
    if (req.is('json') && Boolean(req.body)) {
      try { req.json = JSON.parse(req.body); }
      catch (e) { req.json = {}; }
    }
    return next();
  },

  // request metadata logger
  logger: (req, res, next) => {
    const ref = req.get('referer') || false;

    if (ref) {
      const url = req.originalUrl;

      // todo: logging
    }

    return next();
  },

  // serve static files to client
  static: require('express').static('static', {
    extensions: ['html']
  }),

  // request/response helpers
  helpers: (req, res, next) => {

    // load benchmark spec
    req.loadBspec = (bspec, next) => {
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
        'cache/tests/' + bspec + '.json',
        'utf8',
        (err, data) => {

          // todo: err handling?
          // if (err) {}

          try { req.benchspec = JSON.parse(data); }
          catch (e) {}

          return next();
        });
    };

    // sends generic 404 error response
    res.sendNotFound = () => {

      // todo: logging
      console.log('sending not found: ' + req.originalUrl);

      res.status(404).sendFile('static/not-found.html', {
        root: __dirname + '/../'
      });
    };

    // sends generic 500 error response
    res.sendError = (errPrivate, errPublic) => {

      // todo: logging
      console.log('sending error: ' + errPrivate);

      // todo: render errPublic error message
      res.status(500).sendFile('static/uh-oh.html', {
        root: __dirname + '/../'
      });
    };

    return next();
  }
});
