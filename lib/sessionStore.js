var nconf = require('nconf');

if (!nconf.get('db')) {
  var MemoryStore = require('connect/lib/middleware/session').MemoryStore;
  module.exports = new MemoryStore();
  return;
}

var Yams  = require('yams');
module.exports = new Yams(function (callback) {
  var getDb = require('./data');

  getDb(function (db) {
    callback(null, db.collection('sessions'));
  });
});