'use strict';
const run = require('express').Router();

// autoload benchmark test for ":id" param
run.param('id', (req, res, next, id) => {

  // load benchmark test content
  req.app.locals.models.benchmark.get(id, (err, benchmark) => {

    // set benchmark attribute
    req.benchmark = err ? false : benchmark;
    next();
  });
});

// define routes
run.route('/:id')
    .get((req, res) => {
      res.json(req.test);
    });

module.exports = run;
