var fs       = require('fs');

var nconf     = require('nconf');
var extend    = require('xtend');
var jade      = require('jade');

var api_explorer_url = require('./api_explorer_script_url');
var apiTmplPath = __dirname + '/api-explorer.jade';
var tutorialTmplPath = __dirname + '/tutorial.jade';

var apiTmpl = jade.compile(fs.readFileSync(apiTmplPath).toString(), {
  filename: apiTmplPath,
  pretty: true
});

var tutorialTmpl = jade.compile(fs.readFileSync(tutorialTmplPath).toString(), {
  filename: tutorialTmplPath,
  pretty: true
});

module.exports = function (req, res, next)  {
  api_explorer_url.get(res.locals.account.clientId, function (err, jadeContext) {
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

    res.locals.navigator = function (ctx) {
      jadeContext = extend(jadeContext, ctx);
      return tutorialTmpl(jadeContext);
    };

    next();
  });
};

