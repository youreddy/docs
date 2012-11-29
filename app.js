var mdoc = require('node-mdoc');
var docsapp = new mdoc.App();

docsapp.on('prerender', function( req, res, doc ){
  res.locals.account = {};
  res.locals.account.userName = 'User Name';
  res.locals.account.namespace =  'namespace.auth0.com';
  res.locals.account.clientId = 'user-clientid';
  res.locals.account.clientSecret = 'user-clientsecret';

  console.log(JSON.stringify(res.locals.account));
}
);

if (!module.parent) {
  var port = process.env.PORT || 3000;
  docsapp.start(port);
  console.log('Server listening on port ' + port);
} else {
  module.exports = docsapp;
}
