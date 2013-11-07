var ejs      = require('ejs');
var fs       = require('fs');
var nconf    = require('nconf');

var widget_script_url = require('./widget_script_url');

var snippets_templates = fs.readdirSync(__dirname + '/snippets')
                           .map(function (fi) {
                            return {
                              id:   fi.replace(/\.html$/, ''),
                              tmpl: ejs.compile(fs.readFileSync(__dirname + '/snippets/' + fi).toString())
                            };
                           });

var WIDGET_FALLBACK_CLIENTID = nconf.get('WIDGET_FALLBACK_CLIENTID');

function include_snippet (locals) {
  return function ( snippet_id ) {
    return snippets_templates.filter(function (sn) {
      return sn.id == snippet_id;
    })[0].tmpl(locals);
  };
}

module.exports = function (app) {
  ['custom', 'embedded', 'link', 'login', 'redirect'].forEach(function (snippet) {
    app.get('/widget2-snippets/' + snippet, function (req, res) {

      widget_script_url.get(req.query.a || WIDGET_FALLBACK_CLIENTID, function (err, widgetUrl, assetsUrl, tenant_domain, namespace, client, auth0jsUrl) {
        var jadelocals = {
          widget_url:     widgetUrl,
          auth0js_url:    auth0jsUrl,
          callbackOnHash: req.query.callbackOnHash === 'true',
          account: {
            namespace:  namespace,
            clientId:   client.clientID,
            callback:   client.callback
          }
        };

        res.locals.include_snippet = include_snippet(jadelocals);
        res.render(__dirname + '/snippets/' + snippet);
      });
    });
  });
};
