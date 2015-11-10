'use strict';
const user = module.exports = require('express').Router();
const request = require('superagent');
const crypto = require('crypto');

// quick load user session status
user.get('/api/user', (req, res) =>
  req.session.user ?
    res.header('x-user', req.session.user.login).send() :
    res.status(401).send());

// load full user session profile
user.get('/api/user/profile', (req, res) =>
  req.session.user ?
    res.header('x-user', req.session.user.login).json(req.session.user) :
    res.status(401).json({}));

// quick set csrf token in session
user.get('/api/user/csrf', (req, res) =>
  crypto.randomBytes(4, (ex, buf) => {
    req.session.csrf = buf.toString('hex');
    res.header('x-csrf', req.session.csrf).send();
  }));

// log in user via oauth
user.get('/api/user/oauth/:type',

  // pre-oauth housekeeping
  (req, res, next) => {

    // validate csrf
    if (Boolean(req.session.csrf) == false ||
      req.session.csrf != req.query.state) {
      res.status(400).send();
      return next('route');
    }

    // clear previous existing user session
    delete req.session.user;

    // if set, save redirect query (ignore external URLs)
    if (req.query.redirect &&
      /^.*?:\/\/.*/.test(req.query.redirect) == false) {
      req.session.redirect = '/' + req.query.redirect.replace(/^\/+/, '');
    }

    return next();
  },

  // perform oauth provider logic
  (req, res, next) => {
    const oauthConfig = (req.app.locals.cfg || {}).oauth || {};

    // github oauth provider logic
    if (req.params.type == 'github' &&
      Boolean(oauthConfig.githubID) &&
      Boolean(oauthConfig.githubSecret)) {

      // if the initial oauth code does not exist,
      // return oauth redirect response
      if (Boolean(req.query.code) == false) {
        res.redirect(
          'https://github.com/login/oauth/authorize?' +
          'client_id=' + oauthConfig.githubID +
          '&state=' + req.session.csrf);
        return next('route');
      }

      // otherwise, attempt real github oauth process
      // by using code to get access_token,
      // and then access_token to get user profile.
      else {

        // trade "code" for "access_token"
        request.post('https://github.com/login/oauth/access_token')
          .set('Accept', 'application/json')
          .send({
            client_id:      oauthConfig.githubID,                // jscs: ignore
            client_secret:  oauthConfig.githubSecret,            // jscs: ignore
            code:           req.query.code,
            state:          req.session.csrf
          })
          .end((err, ghr) => {

            // todo: err handling
            if (err || Boolean(ghr.body.access_token) == false) {// jscs: ignore
              res.status(500).send();
              return next('route');
            }

            // trade "access_token" for user profile
            request.get('https://api.github.com/user')
              .query({access_token: ghr.body.access_token})      // jscs: ignore
              .set('Accept', 'application/json')
              .set('User-Agent', 'jsop.io') // required
              .end((err, ghr) => {

                // todo: err handling
                if (err || Boolean(ghr.body) == false) {
                  res.status(500).send();
                  return next('route');
                }

                req.oauth = res.body; // save user github profile
                return next(); // end oauth middleware
              });
          });
      }
    }

    // twitter oauth provider logic
    // else if (req.params.type == 'twitter' &&
    //   Boolean(oauthConfig.twitterID) &&
    //   Boolean(oauthConfig.twitterSecret)) {
    //
    // }

    // otherwise, no valid provider exists,
    // and we're not in production, so auth as dummy profile
    else {
      req.oauth = {
        'login':      'octocat',
        'name':       'monalisa octocat',
        'company':    'GitHub',
        'location':   'San Francisco',
        'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
        'html_url':   'https://github.com/octocat'
      };

      return next();
    }
  },

  // post-oauth housekeeping
  (req, res) => {

    // expect oauth successful at this point
    if (Boolean(req.oauth) == false) {
      throw new Error('unexpected missing req.oauth');
    }

    // save user to session
    req.session.user = req.oauth;

    // handle final response
    res.redirect(req.session.redirect || '/');
    delete req.session.redirect;
  }
);

// log out user and clear session
user.get('/api/user/logout', (req, res) => {
  req.session.destroy();
  res.send();
});
