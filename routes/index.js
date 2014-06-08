'use strict';

var user = require('../controllers/user');
var session = require('../controllers/session');
var authenticate = require('../middleware/authenticate');

module.exports = function(app) {

  app.route('/signin')
    .post(session.create);

  app.route('/signup')
    .post(user.create);

  app.route('/session')
    .post(authenticate, user.show);

  app.route('/test')
    .get(function(req, res) {
      res.send('hello');
    });

};
