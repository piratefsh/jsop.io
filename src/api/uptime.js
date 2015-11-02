'use strict';
const uptime = require('express').Router({strict: true});

// track server uptime start
var start = Date.now();

// return basic server statistics
uptime.get('/', function(req, res) {
  res.send({
    uptime: Date.now() - start
  });
});

module.exports = uptime;
