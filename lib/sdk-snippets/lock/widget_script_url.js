var nconf             = require('nconf');
var clients           = require('../../clients');

var env               = nconf.get('NODE_ENV');
var LOGIN_WIDGET_URL  = nconf.get('LOGIN_WIDGET_URL');
var AUTH0JS_URL       = nconf.get('AUTH0JS_URL');
var DOMAIN_URL_SERVER = nconf.get('DOMAIN_URL_SERVER');

exports.get = function (clientID, done) {
  clients.findByClientId(clientID, function (err, client) {
    if (err) return done(err);

    var namespace = DOMAIN_URL_SERVER.replace('{tenant}', client ? client.tenant : 'YOUR-DOMAIN');
    var tenant_domain = 'https://' + namespace;
    var assets_url;

    if (env !== 'production') {
      assets_url = tenant_domain + '/';
    }

    done(null, LOGIN_WIDGET_URL, assets_url, tenant_domain, namespace, client, AUTH0JS_URL);
  });
};
