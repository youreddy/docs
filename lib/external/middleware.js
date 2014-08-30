var fs        = require('fs');
var nconf     = require('nconf');
var xtend     = require('xtend');
var jade      = require('jade');

var apiTmplPath = __dirname + '/api-explorer.jade';

var apiTmpl = jade.compile(fs.readFileSync(apiTmplPath).toString(), {
  filename: apiTmplPath,
  pretty: true
});

module.exports = function (req, res, next)  {
  // the right-most property takes presedence
  var jadeContext = xtend({}, res.locals, { docsDomain: nconf.get('DOMAIN_URL_DOCS') });

  if (res.locals.account.loggedIn && req.user.is_owner) {
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
    jadeContext = xtend(jadeContext, ctx);

    // force read-only mode for 'Authentication API' when tenant doesn't have any app
    if (!jadeContext.readOnly) {
      jadeContext.readOnly = !!(ctx.isAuth && (!res.locals.account.clients || res.locals.account.clients.length === 0));
    }

    return apiTmpl(jadeContext);
  };

  next();
};
