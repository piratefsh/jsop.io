var express = require('express');
var user = express();

// returns current status of user session
user.head('/', checkSession);
user.get('/', checkSession);
function checkSession(req, res) {
  res.send('user');
}

user.post('/oauth-token', function(req, res) {
  res.send('user');
});

module.exports = user;
