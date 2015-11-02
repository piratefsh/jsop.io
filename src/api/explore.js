'use strict';
const explore = require('express').Router({strict: true});

explore.get('/', function(req, res) {
  res.send('explore');
});

module.exports = explore;
