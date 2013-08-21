var getDb = require('./data');
var Yams  = require('yams');

module.exports = new Yams(function (callback) {
  getDb(function (db) {
    callback(null, db.collection('sessions'));
  });
});