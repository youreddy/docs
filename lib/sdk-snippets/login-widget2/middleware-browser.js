var jade     = require('jade');
var fs       = require('fs');
var nconf    = require('nconf');
var tmplPath = __dirname + '/browser.jade';
var widget_script_url = require('./widget_script_url');

var tmpl     = jade.compile(fs.readFileSync(tmplPath).toString(), {
  filename: tmplPath,
  pretty: true
});

module.exports = function (req, res, next)  {
  if (process.env.NODE_ENV !== "production") {
    tmpl = jade.compile(fs.readFileSync(tmplPath).toString(), {
      filename: tmplPath,
      pretty: process.env.NODE_ENV !== "production"
    });
  }

  widget_script_url.get(res.locals.account.clientId, function (err, url) {
    var jadelocals = { callbackOnHashMode: false };
    jadelocals.widget_url = url;

    Object.keys(res.locals).forEach(function (k) {
      jadelocals[k] = res.locals[k];
    });

    jadelocals.DOMAIN_URL_DOCS = nconf.get('DOMAIN_URL_DOCS');

    res.locals.browser = tmpl(jadelocals);

    next();
  });
};
