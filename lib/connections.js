var getDb = require('./data');

var findByTicket = exports.findByTicket = function (ticket, callback) {
  getDb(function (db) {
    db.collection('connections').findOne({
      provisioning_ticket: ticket
    }, callback);
  });
};

exports.getCurrentStep = function (ticket, callback) {
  /*
   * Step 1: until the first thumbprints are set.
   * Step 2: until there is at least one user for the connection
   * Step 3: until there is more than one user for the connection
   * Step 4: until the connection.options.signInEndpoint is different from http://localhost:4000
   * Step 5: finished...!!
   */
  getDb(function (db) {
    findByTicket(ticket, function (err, connection) {
      if (err) return callback(err);
      if (!connection) callback();
      if (!connection.options.thumbprints) return callback(null, { currentStep: 1 });
      if (connection.options.signInEndpoint && connection.options.signInEndpoint !== 'http://localhost:4000/wsfed') {
        return callback(null, { currentStep: 5 });
      }

      db.collection('users').find({
        'identities.0.connection' : connection.name
      }).count(function (err, userCount) {
      
        if (err) return res.send(500);
      
        if (userCount === 0) return callback(null, {currentStep: 2});
      
        if (userCount === 1) return callback(null, {currentStep: 3});
      
        callback(null, {currentStep: 4});
      
      });

    });
  });
};