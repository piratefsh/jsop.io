'use strict';
const user = require('express').Router({strict: true});

// quick load user session status
user.get('/', (req, res) => {
  const profile = req.session.user || false;

  if (profile == false) {
    return res.status(401).send();
  }

  // return userID as header
  res.header('x-user', profile.login);
  return res.send(); // no response body
});

// load full user session profile
user.get('/profile', (req, res) => {
  const profile = req.session.user || false;

  if (profile == false) {
    return res.status(401).json({});
  }

  // return userID as header
  res.header('x-user', profile.login);
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

// log in user via oauth
user.get('/oauth/:oauthType', (req, res) => {

  // clear existing user
  if (req.session.user) {
    delete req.session.user;
  }

  // if set, save redirect query
  if (req.query.redirect &&

    // test to ensure non-external URL
    /^.*?:\/\/.*/.test(req.query.redirect) == false) {

    // save redirect (relative to root)
    req.session.redirect = '/' + req.query.redirect.replace(/^\/+/, '');
  }

  // if oauth unsuccessful
  if (req.oauth == false) {

    // check if oauth redirect is needed
    if (req.oauthRedirect) {
      return res.redirect(req.oauthRedirect);
    }

    // otherwise, return unsuccessful request
    return res.status(400).send();
  }

  // save user to session
  req.session.user = req.oauth;
  console.log(req.oauth);
  // check if redirect was set previously
  const redirect = req.session.redirect || false;
  if (redirect) { // clear if set
    delete req.session.redirect;
  }

  // handle final response
  return res.redirect(redirect || '/');
});

// log out user and clear session
user.get('/logout', (req, res) => {
  req.session.destroy();
  res.send();
});

module.exports = user;
