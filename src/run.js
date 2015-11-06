'use strict';
const run = require('express').Router({strict: true});

// returns test runner content,
// based on requested environment type
run.get('/:type?', (req, res) => {
  const type = req.params.type || 'browser';

  // redirect, if benchspec not found
  if (req.benchspec == false) {
    return res.redirect('/');
  }

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

  // res.json({
  //   params: req.params,
  //   foo: 'bar',
  //   meh: req.benchspec
  // });
});

module.exports = app => run;
