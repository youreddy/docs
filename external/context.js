var nconf             = require('nconf');
var clients           = require('../lib/clients');

var DOMAIN_URL_SERVER = nconf.get('DOMAIN_URL_SERVER');

// TODO Refactor this function and the ones found on sdk and sdk2 folders
exports.get = function (clientID, done) {
  function fin (err, client) {
    if (err) { return done(err); }

    var namespace = DOMAIN_URL_SERVER.replace('{tenant}', client ? client.tenant : 'YOUR-DOMAIN');

    var jadeContext = {
      tenantDomain: namespace
    };

    done(null, jadeContext);
  }

  if (!nconf.get('db')) {
    return fin();
  }

  clients.findByClientId(clientID, fin);
};
