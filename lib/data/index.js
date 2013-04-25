var nconf      = require('nconf');
var getDb = require('mongo-getdb');

getDb.init({url: nconf.get("db")});

module.exports = getDb;