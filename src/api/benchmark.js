'use strict';
const benchmark = module.exports = require('express').Router();
const bspecValidate = require('./../../assert/benchspec');
const _ = require('lodash');
const fs = require('fs');

// validate create/update of benchmark test spec
const valBenchspec = (req, res, next) => {
  let benchspec = req.body || false;
  let benchspecID = (req.benchspec || {}).id || false;

  try {

    // input must exist
    if (benchspec == false) {
      throw 'Missing benchspec (expects application/json)';
    }

    // create a clean whitelisted copy of benchspec
    benchspec = ((bs) => {
      const clean =
        _.pick(bs, ['id', 'title', 'description_md']);
      clean.benchmark =
        _.pick(bs.benchmark, ['html_code', 'js_setup', 'js_teardown']);
      clean.benchmark.dependencies =
        _.map(bs.benchmark.dependencies, (dep) =>
          _.pick(dep, ['name', 'version', 'src', 'var']));
      clean.benchmark.cases =
        _.map(bs.benchmark.cases, (dep) =>
          _.pick(dep, ['id', 'label', 'note_md', 'js_code',
                       'is_async', 'is_default', 'is_archived']));
      return clean;
    })(benchspec);

    // if already exist, input must have matching ID
    if (benchspecID && benchspec.id !== benchspecID) {
      throw 'Benchspec ID mismatch';
    }

    // do general input sanitization
    console.log(benchspec.title);
    benchspec.title = (benchspec.title || '').trim()
      .replace(/\s+/g, ' '); // force single-whitespaces
    console.log(benchspec.title);
    // do general input validations
    var valErrors = bspecValidate(benchspec);
    if (valErrors) { throw {error: valErrors}; }

    // todo: more validation

  }

  catch (e) {
    res.sendError(400, 'invalid input', e);
    return next('route');
  }

  req.body = benchspec;
  return next();
};

// load benchmark spec
const loadBenchspec = (req, res, next, bspec) => {
  const redis = req.app.locals.redis || false;
  req.benchspec = false; // set default property

  // ensure bspec param exists
  if (Boolean(bspec) == false) {

    // if creating new (POST),
    // then continue without error
    if (req.method == 'POST') {
      return next();
    }

    // send not found response
    res.sendError(404);
    return next('route');
  }

  // if available, load benchmark from redis
  if (redis) {

    // todo...
  }

  // if available, lookup from S3
  if (false) {//s3) {

    // todo...
  }

  // lookup from local file cache
  fs.readFile(
    'cache/benchspecs/' + bspec + '.json',
    'utf8',
    (err, data) => {

      try { req.benchspec = JSON.parse(data); }
      catch (e) {}

      if (Boolean(req.benchspec) == false) {
        res.sendError(404);
        return next('route');
      }

      return next();
    });
};

// save/update benchmark spec
const saveBenchspec = (req, res, next) => {
  const redis = req.app.locals.redis || false;
  const benchspec = req.body || false;
  let bspecID = req.params.bspec || false;

  // sanity check
  if (benchspec == false) {
    throw new Error('cannot save benchspec: req.body missing');
  }

  // generate ID for new benchspec
  if (bspecID == false) {
    bspecID = benchspec.id = benchspec.title.toLowerCase()
              .replace(/\s/gm, '-')
              .replace(/[^\d\w-]/gm, '');
  }

  // if available, save benchmark to redis
  if (redis) {

    // todo...
  }

  // if available, save update to S3
  if (false) { //s3) {

    // todo...
  }

  // req.benchspec = benchspec;
  // return next();

  // save to local file cache
  fs.writeFile(
    'cache/benchspecs/' + bspecID + '.json',
    JSON.stringify(benchspec),
    'utf8',
    (err) => {

      // todo: err handling?
      if (err) {} else { req.benchspec = benchspec; }
      return next();
    });
};

// validate benchmark test result
const valBenchspecRes = (req, res, next) => {
  const benchspecRes = req.body || false;

  try {

    // input must exist
    if (benchspecRes == false) {
      throw 'Missing benchspec result (expects application/json)';
    }

    // todo: more validation
  }

  catch (e) {
    res.sendError(400, 'invalid input', e);
    return next('route');
  }

  return next();
};

// load benchmark spec results
const loadBenchspecRes = (req, res, next) => {
  const benchspec = req.benchspec;

  // summary format: breakdown an overall stats average
  // raw: firehouse feed of all known test results
  const format = req.params.format || 'summary';

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
        name: 'foo',
        version: 'bar'
      },
      cases: benchspec.benchmark.cases.map(testcase => ({
        id: testcase.id,
        count: 0, // benchmark.count
        cycles: 0, // benchmark.cycles
        aborted: false, // benchmark.aborted
        error: {}, // benchmark.error
        hz: 100000, // benchmark.hz
        stats: { // benchmark.stats
          'moe': 3.386222714414282e-7,
          'rme': 24.718065270648857,
          'sem': 1.7276646502113683e-7,
          'deviation': 0.0000012458366966287292,
          'mean': 0.0000013699384144094837,
          'sample': [0.000010135781220118569,0.0000015114335502685018],
          'variance': 1.5521090746667844e-12
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

  req.benchspecRes = format == 'summary' ? summary : raw;
  return next();
};

// save benchmark spec results
const saveBenchspecRes = (req, res, next) => {
  return next();
};

// autoload benchmark spec from ":bspec"
benchmark.param('bspec', loadBenchspec);

// SEO-friendly benchmark test runner
benchmark.get('/run/:bspec', (req, res) => {
  const type = req.params.type || 'browser';

  // load test runner based on type
  switch (type) {

    // browser test runner involves returning
    // HTML/CSS + jsop.bundle.js + benchspec.json + jsop.runner.js
    case 'browser':

      return res.render('browser.runner', {
        benchspec: req.benchspec
      });

    // non-browser test runner involves returning
    // jsop.bundle.js + benchspec.json
    // case 'non-browser':
  }
});

// save new benchmark test spec
benchmark.post('/api/benchmark',
  valBenchspec, saveBenchspec, (req, res) =>
  res.json(req.benchspec));

benchmark.route('/api/benchmark/:bspec?')

  // return benchmark test spec
  .get((req, res) => res.json(req.benchspec))

  // update benchmark test spec
  .put(valBenchspec, saveBenchspec, (req, res) => res.json(req.benchspec));

benchmark.route('/api/benchmark/:bspec/results/:format?')

  // save new benchmark test results
  .post(valBenchspecRes, saveBenchspecRes, (req, res) => res.send())

  // return benchmark test result summary
  .get(loadBenchspecRes, (req, res) => res.json(req.benchspecRes));
