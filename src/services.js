'use strict';

// attach persistent services
// (i.e., db, redis, sessions)
module.exports = (app, cfg) => {
  const locals = app.locals;

  // todo: prepare hard db storage (mysql) connection
  // locals.db = cfg.mysqlURI ...

  // prepare quick storage (redis) connection
  app.locals.redis = new (require('ioredis'))(cfg.redisURI);

  // prepare session middleware (uses redis)
  const session = require('express-session');
  app.use(session({
    secret:             cfg.sessKey,
    resave:             false,
    saveUninitialized:  false,
    name:               'jsop-session',
    cookie:             {secure: true},

    store:              new (require('connect-redis')(session))({
                          client: app.locals.redis
                        })
  }));

  // attach oauth services
  app.locals.oauth = {
    // twitter: OAuthTwitter(cfg.oAuthTWID, cfg.oAuthTWScr)
    github: oAuthGithub(cfg.oAuthGHID, cfg.oAuthGHScr)
  };
};

// oauth: github (https://developer.github.com)
const request = require('superagent');
const oAuthGithub = (clientID, clientSecret) =>

  // if clientID & clientSecret were not set,
  (Boolean(clientID) == false ||
   Boolean(clientSecret) == false) ?

    // use a fake github oauth process, which will
    // always return a dummy profile (octocat)
    (code, state, callback) => callback(null, {
      // jscs:disable
      "login": "octocat",
      "avatar_url": "https://github.com/images/error/octocat_happy.gif",
      "html_url": "https://github.com/octocat",
      "name": "monalisa octocat",
      "company": "GitHub",
      "location": "San Francisco"
      // jscs:enable
    }) :

    // otherwise, use real github oauth process
    (code, state, callback) => {

      // if the initial oauth code does not exist,
      // callback indicating oauth redirect
      if (Boolean(code) == false) {
        return callback(null, null,
          'https://github.com/login/oauth/authorize?' +
            'client_id=' + clientID +
            '&state=' + state
        );
      }

      // otherwise, use code to get access_token
      request.post('https://github.com/login/oauth/access_token')
        .set('Accept', 'application/json')
        .send({
          client_id:      clientID,                             // jscs: ignore
          client_secret:  clientSecret,                         // jscs: ignore
          code:           code,
          state:          state
        })
        .end((err, res) => {
          if (err || Boolean(res.body.access_token) == false) { // jscs: ignore
            return callback('token err: ' + err, null);
          }

          // use access_token for looking up profile
          request.get('https://api.github.com/user')
            .query({access_token: res.body.access_token})        // jscs: ignore
            .set('Accept', 'application/json')
            .set('User-Agent', 'jsop.io')  // required for GH API
            .end((err, res) => err ?
              callback('profile err: ' + err, null) :
              callback(null, res.body)
            );
        });
    };
