var nconf             = require('nconf');
var clients           = require('../lib/clients');

var env               = nconf.get('NODE_ENV');
var cdn               = nconf.get('CDN');
var disable_cdn       = nconf.get('DISABLE_CDN');
var DOMAIN_URL_SDK    = nconf.get('DOMAIN_URL_SDK');
var DOMAIN_URL_SERVER = nconf.get('DOMAIN_URL_SERVER');

exports.get = function (clientID, done) {
  clients.findByClientId(clientID, function (err, client) {
    if (err) return done(err);
    
    var tenant_domain = 'https://' + DOMAIN_URL_SERVER.replace('{tenant}', client ? client.tenant : 'YOUR-DOMAIN');
    var sdk_url;

    if (env === 'production' && !disable_cdn) {
      if (cdn) {
        sdk_url = 'https://' + DOMAIN_URL_SDK + '/auth0.js#client=' + clientID + '&cdn=https://' + cdn;
      } else {
        sdk_url = 'https://' + DOMAIN_URL_SDK + '/auth0.js#client=' + clientID;
      }
    } else {
      sdk_url = 'https://' + DOMAIN_URL_SDK + '/auth0.js#client=' + clientID + '&cdn=' + tenant_domain + '&assets=' + tenant_domain;
    }

    done(null, sdk_url, tenant_domain, client);
  });
};
