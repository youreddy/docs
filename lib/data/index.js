var nconf      = require('nconf');
var getDb = require('mongo-getdb');

getDb.init(nconf.get("db"), {
  server: {
    socketOptions: {
      connectTimeoutMS: 500,
      keepAlive: 300
    }
  }
});

module.exports = getDb;