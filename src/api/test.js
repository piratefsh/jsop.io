'use strict';
const test = require('express').Router({strict: true});

// validate create/update of benchmark test spec
const validateBenchspec = (req, res, next) = {

};

// save new benchmark test spec
test.post('/',
  validateBenchspec,
  (req, res) =>
  req.benchspec ?
    res.json(req.benchspec) :
    res.status(400).json(req.benchspecErrors));

// return benchmark test spec
test.get('/', (req, res) =>
  req.benchspec ?
    res.json(req.benchspec) :
    res.status(404).send());

// update benchmark test spec
test.put('/', (req, res) =>
  req.benchspec ?
    res.json(req.benchspec) :
    res.status(400).json(req.benchspecErrors));

module.exports = app => test;
