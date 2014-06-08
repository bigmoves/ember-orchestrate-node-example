'use strict';

var db = require('orchestrate')(process.env.ORCHESTRATE_API_KEY);
var inflect = require('i')();
var Promise = require('rsvp').Promise;

var adapter = {};

adapter.serialize - function(collection, results) {
  var json = {};
  json[collection] = results.map(function(result) {
    var item = {};
    item = result.value;
    item.id = result.path.key;
    return item;
  });
  return json;
};

adapter.search = function(collection, query) {
  var _this = this, results;

  return new Promise(function(resolve, reject) {
    db.search(collection, query)
    .then(function(results) {
      results = results.body.results;
      resolve(_this.serialize(collection, results));
    })
    .fail(function(error) {
      reject(error.body.message);
    })
  });
};

adapter.findMany = function(collection) {
  var _this = this, results;

  return new Promise(function(resolve, reject) {
    db.list(collection)
    .then(function(result) {
      results = result.body.results;
      resolve(_this.serialize(collection, results));
    })
    .fail(function(error) {
      reject(error.body.message);
    })
  });
};

adapter.find = function(collection, id) {
  var resource = inflect.singularize(collection),
      json = {};

  return new Promise(function(resolve, reject) {
    db.get(collection, id)
    .then(function(result) {
      json[resource] = result.body;
      json[resource].id = id;
      resolve(json);
    })
    .fail(function(error) {
      reject(error.body.message);
    });
  });
};

adapter.createRecord = function(collection, id, contents) {
  var resource = inflect.singularize(collection),
      json = {};

  return new Promise(function(resolve, reject) {
    db.put(collection, id, contents)
    .then(function() {
      contents.id = id;
      json[resource] = contents;
      resolve(json);
    })
    .fail(function(error) {
      reject(error.body.message);
    });
  });
};

adapter.update = function(collection, id, update) {
  var resource = inflect.singularize(collection),
      json = {};

  return new Promise(function(resolve, reject) {
    db.put(collection, id, update)
    .then(function() {
      update.id = id;
      json[resource] = update;
      resolve(json);
    })
    .fail(function(error) {
      reject(error.body.message);
    });
  });
};

module.exports = {
  db: db,
  adapter: adapter
};
