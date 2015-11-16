'use strict';
const session = require('express-session');

module.exports = app => [

  // client session middleware
  session({
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

  // serve static files to client
  require('express').static('static', {
    extensions: ['html', 'htm']
  }),

  // request metadata logger
  (req, res, next) => {
    const ref = req.get('referer') || false;

    if (ref) {
      const url = req.originalUrl;

      // todo: logging
    }

    return next();
  },

  // enable CORS
  function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept');
    next();
  },

  // json request body parser
  require('body-parser').json(),

  // request/response helpers
  (req, res, next) => {

    // helper: logs and sends generic error response
    res.sendError = (code, errPrivate, errPublic) => {
      const isAPI = req.path.indexOf('/api') === 0;
      errPrivate = errPrivate || code == 404 ? req.originalUrl : '';
      errPublic = errPublic || '';

      // todo: logging
      // console.log('error [' + code + '] private: ' + errPrivate);

      // set error http status code
      res.status(code);

      // for APIs, send json bodies
      if (isAPI) {
        return res.json(
          typeof errPublic == 'object' ? errPublic :
          (typeof errPublic == 'string' ? {error: errPublic} : {}));
      }

      // todo: render errPublic error message
      return res.sendFile(code == 404 ?
        'static/not-found.html' :
        'static/uh-oh.html', {
        root: __dirname + '/../'
      });
    };

    return next();
  }
];
