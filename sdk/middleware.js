var jade     = require('jade');
var ejs      = require('ejs');
var fs       = require('fs');
var nconf    = require('nconf');

var snippets_templates = fs.readdirSync(__dirname + '/snippets')
                           .map(function (fi) {
                            return {
                              id:   fi.replace(/\.html$/, ''),
                              tmpl: ejs.compile(fs.readFileSync(__dirname + '/snippets/' + fi).toString())
                            };
                           });

var tmplPath = __dirname + '/index.jade';
var widget_script_url = require('./widget_script_url');

var tmpl     = jade.compile(fs.readFileSync(tmplPath).toString(), {
  filename: tmplPath,
  pretty: process.env.NODE_ENV !== "production"
});

function include_snippet (locals) {
  return function ( snippet_id ) {
    return snippets_templates.filter(function (sn) {
      return sn.id == snippet_id;
    })[0].tmpl(locals);
  };
}

module.exports = function (req, res, next)  {
  
  if (process.env.NODE_ENV !== "production") {
    tmpl = jade.compile(fs.readFileSync(tmplPath).toString(), {
      filename: tmplPath,
      pretty: process.env.NODE_ENV !== "production"
    });
  }

  widget_script_url.get(res.locals.account.clientId, function (err, url) {
    var jadelocals = {};
    jadelocals.auth0_sdk_route = url;

    Object.keys(res.locals).forEach(function (k) {
      jadelocals[k] = res.locals[k];
    });

    jadelocals.DOMAIN_URL_DOCS = nconf.get('DOMAIN_URL_DOCS');

    jadelocals.include_snippet = include_snippet(jadelocals);

    res.locals.sdk = tmpl(jadelocals);
    next();
  });
};