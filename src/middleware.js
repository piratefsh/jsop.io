'use strict';

// attach middleware (e.g., logging, error handling)
module.exports = (app, cfg) => {

  // prepare quick storage (redis) connection, if available
  const redis = cfg.redisURI && new (require('ioredis'))(cfg.redisURI);

  // attach session middleware (uses redis)
  app.use(session(cfg.sessKey, redis));

  // attach param ':oauthType' middleware
  app.param('oauthType', oauthParam(cfg.oauth));

  // attach param ':benchmark' middleware
  app.param('benchmark', benchmarkParam(redis));

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

// session middleware
const session = (secretKey, redis) => {
  const expSession = require('express-session');
  return expSession({
    secret:             secretKey,
    resave:             false,
    saveUninitialized:  false,
    name:               'jsop-session',
    cookie:             {secure: true},

    store:              redis && // use redis, if available
                        new (require('connect-redis')(expSession))({
                          client: redis
                        })
  });
};

// ":oauth-type" param middleware
const request = require('superagent');
const oauthParam = config => (req, res, next, type) => {
  req.oauth = false; // set default property
  console.log('running');

  // determine oauth provider
  switch (type) {

    // github: https://developer.github.com
    case 'github': {
      const state = req.session.csrf || false;

      // prevent csrf login attacks
      if (state == false || req.query.state != state) {

        // todo: err handling
        // ...
        console.log('bad csrf');
        // end oauth middleware
        return next();
      }

      // if githubID or githubSecret were not set,
      if (Boolean(config.githubID) == false ||
          Boolean(config.githubSecret) == false) {
          console.log('here');
        // use a fake github oauth process, and
        // set a dummy profile (octocat)
        req.oauth = {
          'login':      'octocat',
          'name':       'monalisa octocat',
          'company':    'GitHub',
          'location':   'San Francisco',
          'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
          'html_url':   'https://github.com/octocat'
        };

        // end oauth middleware
        return next();
      }

      // if the initial oauth code does not exist,
      // indicate that we need to do oauth redirect
      else if (Boolean(req.query.code) == false) {
        req.oauthRedirect =
            'https://github.com/login/oauth/authorize?' +
            'client_id=' + config.githubID +
            '&state=' + state;

        // end oauth middleware
        return next();
      }

      // finally, attempt real github oauth process
      // by using code to get access_token,
      // and then access_token to get user profile.
      else {

        // trade "code" for "access_token"
        request.post('https://github.com/login/oauth/access_token')
          .set('Accept', 'application/json')
          .send({
            client_id:      config.githubID,                     // jscs: ignore
            client_secret:  config.githubSecret,                 // jscs: ignore
            code:           req.query.code,
            state:          req.query.state
          })
          .end((err, res) => {

            // todo: err handling
            if (err || Boolean(res.body.access_token) == false) {// jscs: ignore
              return next(); // end oauth middleware
            }

            // trade "access_token" for user profile
            request.get('https://api.github.com/user')
              .query({access_token: res.body.access_token})      // jscs: ignore
              .set('Accept', 'application/json')
              .set('User-Agent', 'jsop.io') // required
              .end((err, res) => {

                // todo: err handling
                if (err || Boolean(res.body) == false) {
                  return next(); // end oauth middleware
                }

                req.oauth = res.body; // save user github profile
                return next(); // end oauth middleware
              });
          });
      }
    }
  }
};

// ":benchmark" param middleware
const fs = require('fs');
const benchmarkParam = redis => (req, res, next, benchmark) => {
  req.benchmark = false; // set default property

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
    'cache/tests/' + testID + '.json',
    (err, data) => {

      if (err) { // todo: err handling
        return next(); // end benchmark middleware
      }

      try { data = JSON.parse(data); }
      catch (e) { data = false; }

      if (data) {
        req.benchmark = data;
      }

      return next();// end benchmark middleware
    }
  );
};
