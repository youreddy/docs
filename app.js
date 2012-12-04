var mdoc = require('markdocs');
var docsapp = new mdoc.App();

docsapp.on('prerender', function( req, res, doc ){
  res.locals.account = {};
  res.locals.account.userName = 'User Name';
  res.locals.account.namespace =  'https://YOUR_NAMESPACE.auth0.com';
  res.locals.account.clientId = 'YOUR_CLIENT_ID';
  res.locals.account.clientSecret = 'YOUR_CLIENT_SECRET';

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
