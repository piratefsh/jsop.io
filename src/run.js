'use strict';
const express = require('express');
const run = express.Router();

// retrieve benchmark test for ":id" param
run.param('id', (req, res, next, id) => {
  req.test = {};
  next();
});

// define routes
run.route('/:id')
    .get((req, res) => {
      res.json(req.test);
    });

module.exports = run;
