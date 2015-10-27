var express = require('express');
var benchmark = express();

benchmark.get('/', function(req, res) {
  res.send('benchmark');
});

module.exports = benchmark;
