var authorizations = module.exports;
var getDb          = require('./data');

authorizations.getUserTenants = function(userId, callback) {
  getDb(function (db) {
    db.collection('clients').distinct('tenant', { owners: userId }, function (err, tenants) {
      if (err) { return callback(err); }
      tenants.sort();
      callback(null, tenants);
    });
  });
};
