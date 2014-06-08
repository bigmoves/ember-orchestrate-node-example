// WIP Should make it so that the db adapter only serializes schema defined in
// the model

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

function User() {
  this.schema = {
    firstName: String,
    lastName: String,
    email: String,
    password: String
  }
};

User.prototype.makeHash = function(password) {
  return bcrypt.hashSync(password, salt);
};

User.prototype.authenticate = function(password, claim) {
  return bcrypt.compareSync(password, claim);
};

module.exports = new User();
