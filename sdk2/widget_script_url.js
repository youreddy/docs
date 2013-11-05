var nconf             = require('nconf');
var getDb             = require('../lib/data');

var env               = nconf.get('NODE_ENV');
var DOMAIN_URL_SDK    = nconf.get('DOMAIN_URL_SDK2');
var DOMAIN_URL_SERVER = nconf.get('DOMAIN_URL_SERVER');

exports.get = function (clientID, done) {
  getDb(function (db) {
    db.collection('clients').findOne({ clientID: clientID }, function (err, client) {
      if (err) return done(err);

      var namespace = DOMAIN_URL_SERVER.replace('{tenant}', client ? client.tenant : 'YOUR-DOMAIN');
      var tenant_domain = 'https://' + namespace;
      var sdk_url = 'https://' + DOMAIN_URL_SDK;
      var assets_url;

      if (env !== 'production') {
        assets_url = tenant_domain + '/';
      } 

      done(null, sdk_url, assets_url, tenant_domain, namespace, client);
    });
  });
};
