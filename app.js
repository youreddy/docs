var markdocs = require('markdocs');
var nconf    = require('nconf');
var path     = require('path');
var express  = require('express');
var http     = require('http');
var https    = require('https');
var passport = require('passport');
var fs = require('fs');

var app = express();

nconf
  .use("memory")
  .argv()
  .env()
  .file({ file: process.env.CONFIG_FILE || path.join(__dirname, "config.json")})
  .defaults({
    'db' :               'mongodb://localhost:27017/auth11',
    'sessionSecret':     'auth11 secret string',
    'COOKIE_SCOPE':      process.env.NODE_ENV === 'production' ? '.auth0.com' : null,
    'DOMAIN_URL_SERVER': '{tenant}.auth0.com:3000',
    'DOMAIN_URL_APP':    'localhost:8989',
    'DOMAIN_URL_SDK':    'login-dev.auth0.com:3000',
    'DOMAIN_URL_DOCS':   'https://localhost:5050',
    'WIDGET_FALLBACK_CLIENTID': 'aCbTAJNi5HbsjPJtRpSP6BIoLPOrSj2C',
    'LOGIN_WIDGET_URL':  'https://cdn.auth0.com/w2/auth0-widget-2.4.min.js',
    'AUTH0JS_URL':       'https://cdn.auth0.com/w2/auth0-1.2.2.min.js',
    'SENSITIVE_DATA_ENCRYPTION_KEY': '0123456789',
    'PUBLIC_ALLOWED_TUTORIALS': '/adldap-auth?,/adldap-x?,/adfs?',
  });

if (nconf.get('NEWRELIC_KEY')) {
  require('newrelic');
}

if (!nconf.get('LOGIN_WIDGET_URL')) {
  nconf.set('LOGIN_WIDGET_URL', 'https://' + nconf.get('DOMAIN_URL_SDK') + '/w2/auth0-widget.min.js');
}

if (!nconf.get('AUTH0JS_URL')) {
  nconf.set('AUTH0JS_URL', 'https://' + nconf.get('DOMAIN_URL_SDK') + '/w2/auth0.min.js');
}

var connections = require('./lib/connections');
var clients     = require('./lib/clients');

var getDb = require('./lib/data');

require('./lib/setupLogger');
var winston = require('winston');

passport.serializeUser(function(user, done) {
   done(null, user.id);
 });

passport.deserializeUser(function(id, done) {
  getDb(function(db){
    var userColl = db.collection("tenantUsers");
    userColl.findOne({id: id}, done);
  });
});

//force https
app.configure('production', function(){

  this.use(function(req, res, next){
    if (nconf.get('dontForceHttps') || req.originalUrl === '/test') return next();

    if(req.headers['x-forwarded-proto'] !== 'https')
      return res.redirect(nconf.get('DOMAIN_URL_DOCS') + req.url);

    next();
  });
});

app.configure(function(){
  this.set("view engine", "jade");
  this.use(express.logger('dev'));
  this.use('/test', function (req, res) {
    var ping_check = setTimeout(function () {
      winston.error('cant connect to the database (/test mongo ping timedout)');
      res.send(500, 'cann\'t connect to the database');
      process.exit(1);
    }, 5000);
    getDb(function (db) {
      db.command({ping: 1}, function (err) {
        clearTimeout(ping_check);
        if (err) {
          winston.error('cant connect to the database (/test)');
          res.send(500, 'cann\'t connect to the database');
        }
        var result = process.memoryUsage();
        result['db status'] = 'ok';
        return res.json(200, result);
      });
    });
  });

  this.use(function (req, res, next) {
    res.set({
      'Access-Control-Allow-Origin': (process.env.NODE_ENV === 'production' ? 'https' : 'http') + '://' + nconf.get('DOMAIN_URL_APP')
    });
    next();
  });

  this.use(express.cookieParser());

  this.use(express.session({
    secret: nconf.get("sessionSecret"),
    store: require('./lib/sessionStore'),
    key: "auth0l", cookie: {
      domain:   nconf.get('COOKIE_SCOPE'),
      path:     '/',
      httpOnly: true,
      maxAge:   null,
      secure:   !nconf.get('dontForceHttps') && nconf.get('NODE_ENV') === 'production'
    }
  }));

  this.use(express.favicon());
  this.use(express.logger('dev'));
  this.use(express.bodyParser());
  this.use(express.methodOverride());
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(this.router);
});

app.get('/ticket/step', function (req, res) {
  if (!req.query.ticket) return res.send(404);
  connections.getCurrentStep(req.query.ticket, function (err, currentStep) {
    if (err) return res.send(500);
    if (!currentStep) return res.send(404);
    res.send(currentStep);
  });
});

var defaultValues = function (req, res, next) {
  res.locals.account = {};
  res.locals.account.userName     = '';
  res.locals.account.appName      = 'YOUR_APP_NAME';
  res.locals.account.tenant       = 'YOUR_TENANT';
  res.locals.account.namespace    = 'YOUR_NAMESPACE';
  res.locals.account.clientId     = 'YOUR_CLIENT_ID';
  res.locals.account.clientSecret = 'YOUR_CLIENT_SECRET';
  res.locals.account.callback     = 'http://YOUR_APP/callback';

  next();
};

var embedded = function (req, res, next) {
  res.locals.embedded = false;
  if (req.query.e || req.query.callback) {
    res.locals.base_url = nconf.get('DOMAIN_URL_DOCS');
    res.locals.embedded = true;
  }

  if (req.query.callback) {
    res.locals.jsonp = true;
  }

  next();
};

var overrideIfAuthenticated = function (req, res, next) {
  winston.debug('user', req.user);

  if (!req.user || !req.user.tenant)
    return next();

  var queryDoc = {tenant: req.user.tenant};

  if(req.session.selectedClient){
    queryDoc.clientID = req.session.selectedClient;
  }

  clients.find(queryDoc, function (err, clients) {
    if (err) {
      winston.error("error: " + err);
      return next(err);
    }

    var globalClient, nonGlobalClients = [];

    clients.forEach(function (client) {
      if (client.global) {
        globalClient = client;
        return;
      }

      nonGlobalClients.push(client);
    });

    if (nonGlobalClients.length === 0) return next();

    winston.debug('client found');

    res.locals.account.loggedIn = true;

    res.locals.account.clients = nonGlobalClients;
    var client = nonGlobalClients[0];

    res.locals.account.globalClientId = globalClient.clientID;
    res.locals.account.globalClientSecret = globalClient.clientSecret;

    res.locals.account.appName = client.name && client.name.trim !== '' ? client.name : 'Your App';
    res.locals.account.userName = req.user.name;
    res.locals.account.namespace = nconf.get('DOMAIN_URL_SERVER').replace('{tenant}', client.tenant);
    res.locals.account.tenant = client.tenant;
    res.locals.account.clientId = client.clientID;
    res.locals.account.clientSecret = client.clientSecret;
    res.locals.account.callback = client.callback;
    next();
  });
};

var overrideIfClientInQsForPublicAllowedUrls = function (req, res, next) {

  var allowed = nconf.get('PUBLIC_ALLOWED_TUTORIALS').split(',').some(function (allowedUrl) {
    return req.originalUrl.indexOf(allowedUrl) === 0;
  });

  if (!allowed) return next();
  if (!req.query || !req.query.a) return next();

  clients.findByClientId(req.query.a, { signingKey: 0 }, function (err, client) {
    if (err) {
      console.error("error: " + err);
      return next(err);
    }

    if (!client) {
      return res.send(404, 'client not found');
    }

    res.locals.account.appName      = client.name && client.name.trim !== '' ? client.name : 'Your App';
    res.locals.account.namespace    = nconf.get('DOMAIN_URL_SERVER').replace('{tenant}', client.tenant);
    res.locals.account.tenant       = client.tenant;
    res.locals.account.clientId     = client.clientID;
    res.locals.account.clientSecret = client.clientSecret;
    res.locals.account.callback     = client.callback;

    next();
  });
};

var overrideIfClientInQs = function (req, res, next) {
  if (!req.query || !req.query.a) return next();
  if (!req.user || !req.user.tenant) return next();

  clients.findByTenantAndClientId(req.user.tenant, req.query.a, function (err, client) {
    if (err) {
      console.error("error: " + err);
      return next(err);
    }

    if (!client) {
      return res.send(404, 'client not found');
    }

    res.locals.account.appName      = client.name && client.name.trim !== '' ? client.name : 'Your App';
    res.locals.account.namespace    = nconf.get('DOMAIN_URL_SERVER').replace('{tenant}', client.tenant);
    res.locals.account.tenant       = client.tenant;
    res.locals.account.clientId     = client.clientID;
    res.locals.account.clientSecret = client.clientSecret;
    res.locals.account.callback     = client.callback;

    next();
  });
};

var appendTicket = function (req, res, next) {
  res.locals.ticket = 'YOUR_TICKET';
  res.locals.connectionDomain = 'YOUR_CONNECTION_NAME';
  res.locals.connectionName = 'YOUR_CONNECTION_NAME';
  if (!req.query.ticket) return next();
  connections.findByTicket(req.query.ticket, function (err, connection) {
    if (err) return res.send(500);
    if (!connection) return res.send(404);
    res.locals.ticket = req.query.ticket;
    res.locals.connectionDomain = connection.options.tenant_domain;
    res.locals.connectionName = connection.name;
    next();
  });
};

var includes = require('./includes/includes');
includes.init(path.join(__dirname, '/docs/includes'));

var docsapp = new markdocs.App(__dirname, '', app);
docsapp.addPreRender(defaultValues);
docsapp.addPreRender(includes.add);;
docsapp.addPreRender(overrideIfAuthenticated);
docsapp.addPreRender(overrideIfClientInQs);
docsapp.addPreRender(overrideIfClientInQsForPublicAllowedUrls);
docsapp.addPreRender(appendTicket);
docsapp.addPreRender(embedded);
docsapp.addPreRender(function(req,res,next){
  if(process.env.NODE_ENV === 'production') {
    res.locals.uiURL   = 'https://' + nconf.get('DOMAIN_URL_APP');
    res.locals.sdkURL  = 'https://' + nconf.get('DOMAIN_URL_SDK');
    res.locals.widget_url = nconf.get('LOGIN_WIDGET_URL');
  } else {
    res.locals.uiURL   = 'http://' + nconf.get('DOMAIN_URL_APP');
    res.locals.sdkURL  = 'http://' + nconf.get('DOMAIN_URL_SDK');
    res.locals.widget_url = nconf.get('LOGIN_WIDGET_URL');
  }
  next();
});

docsapp.addPreRender(require('./api-explorer/middleware'));
docsapp.addPreRender(require('./sdk/middleware'));
docsapp.addPreRender(require('./sdk2/middleware'));
require('./sdk/demos-routes')(app);
require('./sdk2/demos-routes')(app);
require('./sdk2/snippets-routes')(app);
require('./lib/sitemap')(app);

if (!module.parent) {
  var server;
  if (process.env.NODE_ENV === 'production') {
    server = http.createServer(app);
  } else {
    var options = {
      key:  fs.readFileSync('./localhost.key'),
      cert: fs.readFileSync('./localhost.pem')
    };

    server = https.createServer(options, app)
                  .on('error', function (err) {
                    if(err.errno === 'EADDRINUSE'){
                      console.log('error when running http server on port ', port, '\n', err.message);
                      process.exit(1);
                    }
                  });
  }

  var port = nconf.get('PORT') || 5050;
  server.listen(port);
  console.log('Server listening on https://localhost:'  + port);
} else {
  module.exports = docsapp;
}
