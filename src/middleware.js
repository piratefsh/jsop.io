'use strict';

// attach middleware (e.g., logging, error handling)
module.exports = (app, cfg) => {

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
