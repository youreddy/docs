var authorizations = module.exports;
var getDb          = require('./data');
var clients        = require('./clients');

authorizations.getUserTenants = function(userId, callback) {
  getDb(function (db) {
    db.collection('clients').distinct('tenant', { owners: userId }, function (err, tenants) {
      if (err) { return callback(err); }
      tenants.sort();
      callback(null, tenants);
    });
  });
};

authorizations.getTenantOwners = function(tenant, callback) {
  clients.find({ tenant: tenant, global: true }, function (err, clients) {
    if (err) { return callback(err); }

    var globalClient = clients && clients[0];

    if (!globalClient || !globalClient.owners) {
      return callback(null, []);
    }
    
    getDb(function (db) {
      db.collection('tenantUsers').find({ id: { $in: globalClient.owners } }).toArray(callback);
    });
  });
};
