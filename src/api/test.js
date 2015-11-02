'use strict';
const test = require('express').Router({strict: true});

// saveBenchmark helper: validate, then set (overwriting, if exist)
const saveBenchmark = (req, res) => {
  console.log('saving bench');

  // todo: validate

  // save benchmark test content
  req.app.locals.models.benchmark.set(req.body, err => {
    // todo: handle err
  });
};

// autoload benchmark test for ":id" param
test.param('id', (req, res, next, id) => {

  // load benchmark test content
  req.app.locals.models.benchmark.get(id, (err, benchmark) => {

    // set benchmark attribute
    req.benchmark = err ? false : benchmark;
    next();
  });
});

// auto-parse JSON request bodies
test.use((req, res, next) => {

  // do nothing for non-json or empty bodies
  if ((req.is('json') && Boolean(req.body)) == false) {
    return next();
  }

  // do json parsing
  try { req.json = JSON.parse(req.body); }
  catch (e) { req.json = {}; }

  next();
});

// create new benchmark test
test.post('/', saveBenchmark);

// declare all actions for this route
test.route('/:id')

  // return benchmark test
  .get((req, res) => req.benchmark ?
    res.json(req.benchmark) :
    res.status(404).send())

  // update benchmark test
  .post(saveBenchmark)
  .put(saveBenchmark);

module.exports = test;
