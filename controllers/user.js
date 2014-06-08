'use strict';

var db = require('../db').adapter;
var User = require('../models/user');
var jwt = require('jwt-simple');

module.exports = {

  create: function(req, res) {
    var user = req.body,
        hash = User.makeHash(user.password);

    db.createRecord('users', user.email, {
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      password: hash
    })
    .then(function(resource) {
      delete resource.user.password;
      res.json(resource);
    })
    .catch(function(error) {
      res.json(404, {error: error});
    });
  },

  show: function(req, res) {
    res.json(req.user || null);
  }

};
