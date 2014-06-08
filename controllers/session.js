'use strict';

var db = require('../db').adapter;
var User = require('../models/user');
var moment = require('moment');
var jwt = require('jwt-simple');

module.exports = {

  create: function(req, res) {
    var email = req.body.email,
        password = req.body.password;

    db.find('users', email)
    .then(function(resource) {

      if (User.authenticate(password, resource.user.password)) {
        var expires = moment().add('days', 7).valueOf();
        var token = jwt.encode({
          iss: resource.user.id,
          exp: expires
        }, 'secret');

        delete resource.user.password;

        res.json({
          token : token,
          expires: expires,
          user: resource.user
        });
      }

    })
    .catch(function(error) {
      res.json(404, {error: error});
    });
  }

};
