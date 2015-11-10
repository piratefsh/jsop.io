'use strict';
const runner = module.exports = require('express').Router({strict: true});

// benchmark test runner in SEO-friendly format
runner.get('/:type?', (req, res) => {
  const type = req.params.type || 'browser';

  // ensure benchspec loaded
  if (req.benchspec == false) {
    return res.sendNotFound();
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
});
