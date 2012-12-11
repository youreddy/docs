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
   done(null, {id: user.id, provider: user.provider});
 });

passport.deserializeUser(function(obj, done) {
  getDb(function(db){
    var userColl = db.collection("tenantUsers");
    userColl.findOne({id: obj.id, provider: obj.provider}, done);
  });
});

app.configure(function(){
  this.set("view engine", "jade");
  this.use(express.logger('dev'));
  this.use(express.cookieParser());
  this.use(express.session({ secret: nconf.get("sessionSecret"), key: "auth0l", cookie: {
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

var docsapp = new markdocs.App(__dirname, '', app);

docsapp.on('prerender', function( req, res, doc ){
  console.log(req.user);
  res.locals.account = {};
  res.locals.account.userName = 'User Name';
  res.locals.account.namespace =  'YOUR_NAMESPACE';
  res.locals.account.clientId = 'YOUR_CLIENT_ID';
  res.locals.account.clientSecret = 'YOUR_CLIENT_SECRET';

  console.log(JSON.stringify(res.locals.account));
}
);

if (!module.parent) {
  var port = process.env.PORT || 3000;
  app.listen(port);
  console.log('Server listening on port ' + port);
} else {
  module.exports = docsapp;
}
