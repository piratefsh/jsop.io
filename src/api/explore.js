var express = require('express');
var explore = express();

// save reference to root application
var root; explore.on('mount', app => {root = app;});

explore.get('/', function(req, res) {
  res.send('explore');
});

module.exports = explore;
