var express = require('express');
var explore = express();

explore.get('/', function(req, res) {
  res.send('explore');
});

module.exports = explore;
