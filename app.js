var markdocs = require('markdocs'),
  nconf = require('nconf'),
  path = require('path'),
  express = require('express'),
  passport = require('passport');

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

passport.serializeUser(function(user, done) {
   done(null, user.id);
 });

passport.deserializeUser(function(id, done) {
  getDb(function(db){
    var userColl = db.collection("tenantUsers");
    userColl.findOne({id: id, provider: 'auth0'}, done);
  });
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
    maxAge: null,
    secure: true
  }}));
  this.use(express.favicon());
  this.use(express.logger('dev'));
  this.use(express.bodyParser());
  this.use(express.methodOverride());
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(this.router);
});

var docsapp = new markdocs.App(__dirname, '', app, function (req, res, next) {
  res.locals.account = {};
  res.locals.account.userName = '';
  res.locals.account.namespace =  'YOUR_NAMESPACE';
  res.locals.account.clientId = 'YOUR_CLIENT_ID';
  res.locals.account.clientSecret = 'YOUR_CLIENT_SECRET';
  
  if (!req.user || !req.user.tenant)
    return next();

  getDb(function(db){
    db.collection('clients').findOne({tenant: req.user.tenant}, function(err, client){
      if(err) {
        console.error("error: " + err);
        return next(err);
      }
      
      res.locals.account.userName = req.user.name;
      res.locals.account.namespace =  client.tenant + '.auth0.com';
      res.locals.account.clientId = client.clientID;
      res.locals.account.clientSecret = client.clientSecret;

      next();
    });
  });
});


if (!module.parent) {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Server listening on port ' + port);
} else {
  module.exports = docsapp;
}
