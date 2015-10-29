'use strict';
const user = require('express').Router();
const https = require('https');

// disable extra headers
// user.disable('etag');
// user.disable('x-powered-by');

// quick load user session status
user.get('/', (req, res) => {
  const profile = req.session.user || false;

  if (profile == false) {
    return res.status(401).send();
  }

  // return userID as header
  res.header('x-user', profile.id);
  return res.send(); // no response body
});

// load full user session profile
user.get('/profile', (req, res) => {
  const profile = req.session.user || false;

  if (profile == false) {
    return res.status(401).json({});
  }

  // return userID as header
  res.header('x-user', profile.id);
  return res.json(profile); // profile as body
});

// quick set csrf token in session
user.get('/csrf', (req, res) => {
  require('crypto').randomBytes(4, function(ex, buf) {
    req.session.csrf = buf.toString('hex');
    res.header('x-csrf', req.session.csrf);
    res.send();
  });
});

// log in user via github oauth
user.get('/oauth-gh', (req, res) => {
  const state = req.session.csrf || false;

  // clear existing user
  if (req.session.user) {
    delete req.session.user;
  }

  // prevent csrf login attacks
  if (req.query.state != state) {
    return res.status(400).json({});
  }

  // if the initial oauth code does not exist
  if (Boolean(req.query.code) == false) {

    // begin oauth authorization step
    return res.redirect(
      'https://github.com/login/oauth/authorize?' +
      'client_id=' + GH_OAUTH_ID +
      '&state=' + state
    );
  }

  // perform github oauth steps
  OAuthGithub(
    req.query.code,
    req.query.state,
    (err, profile) => {
      if (err) { // todo: err handling
        return res.status(400).json({});
      }

      // save profile to user session
      req.session.user = profile;
      res.json(profile);
    });
});

// log out user and clear session
user.get('/logout', (req, res) => {
  req.session.destroy();
  res.send();
});

module.exports = user;

// ----------------------------------------------

// helper: perform server-side Github OAuth
const GH_OAUTH_ID = 'd23e94365835de4422df';
const GH_OAUTH_SECRET = '7a1cbf447cbde2554c9177b60995c3d28f5640eb';
const OAuthGithub = (code, state, callback) => {
  const tokenRq = https.request({
    method: 'POST',
    headers: {Accept: 'application/json'},
    hostname: 'github.com',
    path: '/login/oauth/access_token?' +
          'client_id='      + GH_OAUTH_ID +
          '&client_secret=' + GH_OAUTH_SECRET +
          '&code='          + code +
          '&state='         + state
  }, res => {

    // collect resopnse body
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => body += chunk);

    // parse complete response
    res.on('end', () => {
      try { body = res.statusCode == 200 && JSON.parse(body); }
      catch (e) { body = false; }

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      const token = body &&
                    Boolean(body.access_token) &&
                    body.access_token;
      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers

      // return error on bad access_token
      if (token == false) {
        return callback('no access token', null);
      }

      // use access token for looking up profile
      const profRq = https.request({
        method: 'GET',
        headers: {
          'Accept':     'application/json',
          'User-Agent': 'jsop.io'
        },
        hostname: 'api.github.com',
        path: '/user?access_token=' + token
      }, res => {

        // collect resopnse body
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => body += chunk);

        // parse complete response
        res.on('end', () => {
          try { body = res.statusCode == 200 && JSON.parse(body); }
          catch (e) { body = false; }

          // return response body to callback
          callback(body ? null : 'no user profile', body || null);
        });

      });

      profRq.end();
      profRq.on('error', e => callback(e, null));
    });
  });

  tokenRq.end();
  tokenRq.on('error', e => callback(e, null));
};
