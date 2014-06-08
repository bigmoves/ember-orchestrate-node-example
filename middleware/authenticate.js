'use strict';

var db = require('../db').adapter;
var jwt = require('jwt-simple');

module.exports = function(req, res, next) {
  var token = (req.body && req.body.access_token) ||
              (req.query && req.query.access_token) ||
              req.headers['x-access-token'];

  if (token) {
    var decoded = jwt.decode(token, 'secret');

    if (decoded.exp <= Date.now()) {
      res.end('Access token has expired', 400);
    }

    db.find('users', decoded.iss)
    .then(function(resource) {
      delete resource.user.password;
      req.user = resource.user;
      next();
    })
    .catch(function(error) {
      res.json(404, {error: error});
    });
  } else {
    next();
  }
};
