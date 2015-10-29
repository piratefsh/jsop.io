var express = require('express');
var moment = require('moment');
var runtime = express();

// save reference to root application
var root; runtime.on('mount', app => {root = app;});

// track server uptime start
var uptimeStart = Date.now();

// return basic server statistics
runtime.get('/', function(req, res) {
  res.send({
    uptime: Date.now() - uptimeStart
  });
});

module.exports = runtime;
