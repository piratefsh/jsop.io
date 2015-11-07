'use strict';
const test = require('express').Router({strict: true});
const _ = require('lodash');

// validate create/update of benchmark test spec
const validateBenchspec = (req, res, next) => {

  if (Boolean(req.json) == false) {
    req.benchspecErr = "Missing benchspec (expects application/json).";
    return next();
  }

  // todo: validation

  return next();
};

// validate benchmark test result
const validateBenchspecResult = (req, res, next) => {
  if (Boolean(req.json) == false) {
    req.benchspecResErr = "Missing benchspec result (expects application/json).";
    return next();
  }

  // todo: validation

  return next();
};

// return benchmark test spec
test.get('/', (req, res) =>
  req.benchspec ?
    res.json(req.benchspec) :
    res.status(404).send());

// save new benchmark test spec
test.post('/', validateBenchspec, (req, res) =>
  req.benchspec ?
    res.redirect(req.benchspec.id) :
    res.status(400).json({error: req.benchspecErr}));

// update benchmark test spec
test.put('/', validateBenchspec, (req, res) =>
  req.benchspec ?
    res.json(req.benchspec) :
    res.status(400).json({error: req.benchspecErr}));

// return benchmark test result summary
test.get('/results/:format?', (req, res) => {
  const benchspec = req.benchspec || false;
  const format = req.params.format || 'summary';

  // sanity check
  if (benchspec == false) {
    return res.status(404).send();
  }

  // todo: actually load stats from cache.
  //       the following is just stub mock data
  // -------------------------------------------
  const stats = {
    aborted: 1, // number of failed test results
    hz: 100000, // mean over bench.hz
    rme: 3.11 // mean over bench.stats.rme.toFixed(2)
  };

  const caseStats = benchspec.benchmark.cases.map(testcase =>
    _.extend({}, stats, {id: testcase.id}));

  const summary = {
    id: benchspec.id,
    summary: {
      count: 3,
      cases: caseStats
    },
    platforms: [{
      name: 'IE-10.0', // <platform.name>-<platform.version>
      summary: {
        count: 1,
        cases: caseStats
      }
    },{
      name: 'Chrome',
      summary: {
        count: 2,
        cases: caseStats
      }
    }]
  };

  const raw = {
    id: benchspec.id,
    results: [{
      platform: { // benchmark.platform
        name: "foo",
        version: "bar"
      },
      cases: benchspec.benchmark.cases.map(testcase => ({
        id: testcase.id,
        count: 0, // benchmark.count
        cycles: 0, // benchmark.cycles
        aborted: false, // benchmark.aborted
        error: {}, // benchmark.error
        hz: 100000, // benchmark.hz
        stats: { // benchmark.stats
          "moe": 3.386222714414282e-7,
          "rme": 24.718065270648857,
          "sem": 1.7276646502113683e-7,
          "deviation": 0.0000012458366966287292,
          "mean": 0.0000013699384144094837,
          "sample": [0.000010135781220118569,0.0000015114335502685018],
          "variance": 1.5521090746667844e-12
        },
        times: { // benchmark.times
          cycle: 0.09213657799952424,
          elapsed: 6.558,
          period: 0.0000013699384144094837,
          timeStamp: 1446852951650
        }
      }))
    }]
  };
  // end of summary mock data
  // -------------------------------------------

  // summary format: breakdown an overall stats average
  // raw: firehouse feed of all known test results
  return res.json(format == 'summary' ? summary : raw);
});

// save new benchmark test results
test.post('/results', validateBenchspecResult, (req, res) =>
  req.benchspecResErr ?
    res.status(400).json(req.benchspecResErr) :
    res.send());

module.exports = app => test;
