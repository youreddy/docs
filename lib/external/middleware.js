var fs       = require('fs');

var nconf     = require('nconf');
var extend    = require('xtend');
var jade      = require('jade');

var context = require('./context');
var apiTmplPath = __dirname + '/api-explorer.jade';

var apiTmpl = jade.compile(fs.readFileSync(apiTmplPath).toString(), {
  filename: apiTmplPath,
  pretty: true
});

module.exports = function (req, res, next)  {
  context.get(res.locals.account.clientId, function (err, jadeContext) {
    jadeContext.docsDomain = nconf.get('DOMAIN_URL_DOCS');

    // the right-most property takes presedence.
    jadeCont = extend(res.locals, jadeContext);

    if (res.locals.account.loggedIn) {
      jadeContext.readOnly = false;
      jadeContext.user = {
        id:    req.user.id,
        name:  req.user.name,
        mail:  req.user.mail
      };

      jadeContext.globalClientSecret  = res.locals.account.globalClientSecret;
      jadeContext.globalClientID      = res.locals.account.globalClientId;

    } else {
      jadeContext.readOnly = true;
      jadeContext.user = {
        id:   'john.doe',
        name: 'John Doe',
        mail: 'john@doe.com'
      };
      jadeContext.globalClientSecret  = '';
      jadeContext.globalClientID      = '';
    }

    res.locals.apiExplorer = function (ctx) {
      jadeContext = extend(jadeContext, ctx);
      return apiTmpl(jadeContext);
    };

    next();
  });
};

