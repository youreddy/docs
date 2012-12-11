var mongodb = require("mongodb"),
    winston = require('winston'),
    cachedDb;

var EventEmitter = require("events").EventEmitter,
    dbStatus = new EventEmitter();

var dbSettings = require('./connection-data');

function createConnector() {
  var mongoserver = new mongodb.Server(dbSettings.host, dbSettings.port, {
        auto_reconnect: true,
        socketOptions: { keepAlive: 300 },
        poolSize: 10
      });
  
  return new mongodb.Db(dbSettings.name, mongoserver, {safe: true});
}

db_connector = createConnector();

dbStatus.once("connected", function(db){
  winston.info("connected to mongodb!");
  
  db.ensureIndex("connections", {name: 1, client_id: 1}, {unique: true}, function (err){
    if(err) return winston.error("couldn't ensure the index on connections");
    winston.info("connections indexed");
  });
  
  cachedDb = db;
  
  db.on("close", function(){
    winston.info("connection to mongodb closed");
  });
});


module.exports = function(callback){
  if(!cachedDb){
    dbStatus.once("connected", function(db){
      callback(db);
    });
  }else{
    return process.nextTick(function(){
      return callback(cachedDb);
    });
  }

  if(!db_connector.openCalled){
    winston.info('connecting to db');
    db_connector.open(function(err, db){
      if ( err ) {
        return winston.error('error connecting to the db, exiting', {
          message: err.message,
          stack: err.stack
        }, function(){
          process.exit(0);
        });
      }

      if(dbSettings.user && dbSettings.password){
        winston.info("authenticating to mongodb");
        db.authenticate(dbSettings.user, dbSettings.password, function(err){
          if(err){
            return winston.error('authentication error, exiting', {
              message: err.message,
              stack: err.stack
            }, function(){
              process.exit(0);
            });
          }
          dbStatus.emit("connected", db);
        });
      }else{
        dbStatus.emit("connected", db);
      }
    });
    return;
  }
};

module.exports.createConnector = createConnector;