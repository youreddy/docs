var nconf             = require('nconf');
var getDb             = require('../lib/data');

var DOMAIN_URL_SDK    = nconf.get('DOMAIN_URL_SDK2');
var DOMAIN_URL_SERVER = nconf.get('DOMAIN_URL_SERVER');

exports.get = function (clientID, done) {
  getDb(function (db) {
    db.collection('clients').findOne({ clientID: clientID }, function (err, client) {
        if (err) return done(err);
        var namespace = DOMAIN_URL_SERVER.replace('{tenant}', client ? client.tenant : 'YOUR-DOMAIN');
        var tenant_domain = 'https://' + namespace;
        var sdk_url = 'https://' + DOMAIN_URL_SDK + '/auth0-widget.min.js';

        done(null, sdk_url, tenant_domain, namespace, client);

      });
    });
};
