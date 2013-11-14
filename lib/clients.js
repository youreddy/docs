var clients        = module.exports;
var nconf          = require('nconf');
var utils          = require('./utils');
var getDb          = require('./data');

var sensitiveFields = ['clientSecret'];

function decryptSensitiveFields (client) {
  if (!client || client.encrypted !== true) return client;

  var key = nconf.get('SENSITIVE_DATA_ENCRYPTION_KEY');
  sensitiveFields.forEach(function (f) {
    if (client[f]) {
      client[f] = utils.decryptAesSha256(key, client[f]);
    }
  });

  if (client.signingKey && client.signingKey.key) {
    client.signingKey.key = utils.decryptAesSha256(key, client.signingKey.key);
  }

  return client;
}

function ensureFields (fields) {
  if (!fields) return fields;

  ['tenant', 'encrypted'].forEach(function (f) {
    if (fields[f] === 0) fields[f] = 1;

    Object.keys(fields).forEach(function (k) {
      if (fields[k] === 1) {
        fields[f] = 1;
        return;
      }
    });
  });

  return fields;
}

clients.findByClientId = function(clientID, fields, callback) {
  if (typeof fields === 'function') {
    callback = fields;
    fields = null;
  }

  var done = function (err, client) {
    if (err) return callback(err);
    callback(null, decryptSensitiveFields(client));
  };

  getDb(function (db) {
    if (fields) {
      ensureFields(fields);
      db.collection('clients').findOne({clientID: clientID}, fields, done);
    } else {
      db.collection('clients').findOne({clientID: clientID}, { signingKey: 0 }, done);
    }
  });
};

clients.findByTenantAndClientId = function(tenant, clientID, fields, callback) {
  if (typeof fields === 'function') {
    callback = fields;
    fields = null;
  }

  var done = function (err, client) {
    if (err) return callback(err);
    callback(null, decryptSensitiveFields(client));
  };

  getDb(function (db) {
    if (fields) {
      ensureFields(fields);
      db.collection('clients').findOne({tenant: tenant, clientID: clientID}, fields, done);
    } else {
      db.collection('clients').findOne({tenant: tenant, clientID: clientID}, { signingKey: 0 }, done);
    }
  });
};

clients.find = function (query, fields, callback) {
  if (typeof fields === 'function') {
    callback = fields;
    fields = { _id: 0 };
  }

  var done = function (err, clients) {
    if (err) return callback(err);
    callback(null, clients.map(function (c) { return decryptSensitiveFields(c); }));
  };

  getDb(function (db) {
    ensureFields(fields);
    db.collection('clients').find(query, fields).toArray(done);
  });
};
