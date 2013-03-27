var markdocs = require('markdocs'),
  nconf = require('nconf'),
  path = require('path'),
  express = require('express'),
  passport = require('passport'),
  winston = require('winston');

var app = express();

nconf
  .use("memory")
  .argv()
  .env()
  .file({ file: path.join(__dirname, "config.json")})
  .defaults({
    "db" : 'mongodb://localhost:27017/auth11',
    'sessionSecret': 'auth11 secret string'
  });

var getDb = require('./lib/data'),
  MongoStore = require('connect-mongodb'),
  connectionData = require('./lib/data/connection-data'),
  sessionStore = new MongoStore({
    db: getDb.createConnector(),
    username: connectionData.user,
    password: connectionData.password,
    collection: 'sessions'
  });

winston.setLevels(winston.config.syslog.levels);
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { colorize: true, level: nconf.get("consoleLogLevel") || "debug", prettyPrint: true });

passport.serializeUser(function(user, done) {
   done(null, user.id);
 });

passport.deserializeUser(function(id, done) {
  getDb(function(db){
    var userColl = db.collection("tenantUsers");
    userColl.findOne({id: id, provider: 'auth0'}, done);
  });
});

//force https
app.configure('production', function(){
  if(!nconf.get('dontForceHttps')){
    this.use(function(req, res, next){
      if(req.headers['x-forwarded-proto'] !== 'https')
        return res.redirect(nconf.get('baseUrl') + req.url);
      next();
    });
  }
});

app.configure(function(){
  this.set("view engine", "jade");
  this.use(express.logger('dev'));
  this.use(express.cookieParser());
  console.log('setting session mongo');
  this.use(express.session({ secret: nconf.get("sessionSecret"), store: sessionStore, key: "auth0l", cookie: {
    domain: process.env.NODE_ENV === 'production' ? '.auth0.com' : null,
    path: '/',
    httpOnly: true,
    maxAge: null
  }}));
  this.use(express.favicon());
  this.use(express.logger('dev'));
  this.use(express.bodyParser());
  this.use(express.methodOverride());
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(this.router);
});

var defaultValues = function defaultValues (req, res, next) {
  res.locals.account = {};
  res.locals.account.userName = '';
  res.locals.account.appName = 'YOUR_APP_NAME';
  res.locals.account.tenant = 'YOUR_TENANT';
  res.locals.account.namespace =  'YOUR_NAMESPACE';
  res.locals.account.clientId = 'YOUR_CLIENT_ID';
  res.locals.account.clientSecret = 'YOUR_CLIENT_SECRET';
  res.locals.account.callback = 'YOUR_CALLBACK';

  next();
};

var overrideIfAuthenticated = function overrideIfAuthenticated (req, res, next) {
  winston.debug('user', req.user);
  
  if (!req.user || !req.user.tenant)
    return next();

  var queryDoc = {tenant: req.user.tenant};

  if(req.session.selectedClient){
    queryDoc.clientID = req.session.selectedClient;
  }

  getDb(function(db){

    db.collection('clients').findOne(queryDoc, function(err, client){
      if(err) {
        winston.error("error: " + err);
        return next(err);
      }
      
      winston.debug('client found');
      res.locals.account.appName = client.name && client.name.trim !== '' ? client.name : 'Your App';
      console.log(res.locals.account.appName);
      res.locals.account.userName = req.user.name;
      res.locals.account.namespace =  client.tenant + '.auth0.com';
      res.locals.account.tenant = client.tenant;
      res.locals.account.clientId = client.clientID;
      res.locals.account.clientSecret = client.clientSecret;
      res.locals.account.callback = client.callback;
      next();
    });
  });
};

var overrideIfClientInQs = function overrideIfClientInQs (req, res, next) {
  if (!req.query || !req.query.a)
    return next();

  getDb(function(db){
    db.collection('clients').findOne({clientID: req.query.a}, function(err, client){
      if(err) {
        console.error("error: " + err);
        return next(err);
      }

      if(!client) {
        return res.send(404, 'client not found');
      }
      
      res.locals.account.appName   = client.name && client.name.trim !== '' ? client.name : 'Your App';
      res.locals.account.namespace = client.tenant + '.auth0.com';
      res.locals.account.clientId  = client.clientID;

      next();
    });
  });
};

var appendTicket = function (req, res, next) {
  res.locals.ticket = req.query.ticket;
  next();
};

var docsapp = new markdocs.App(__dirname, '', app);
docsapp.addPreRender(defaultValues);
docsapp.addPreRender(overrideIfAuthenticated);
docsapp.addPreRender(overrideIfClientInQs);
docsapp.addPreRender(appendTicket);

if (!module.parent) {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Server listening on port ' + port);
} else {
  module.exports = docsapp;
}
