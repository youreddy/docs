var express    = require('express');
var getDb      = require('./data');
var xtend      = require('xtend');
var MongoStore = require('connect-mongo')(express);

var dbAndCred = getDb.getDbAndCredentials();

var store = new MongoStore(xtend(dbAndCred, {
  collection: 'sessions',
  auto_reconnect: true
}));

module.exports = store;