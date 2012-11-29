var mdoc = require('node-mdoc');
var docsapp = new mdoc.App();

docsapp.on('prerender', function( req, res, doc ){
  res.locals.account = {};
  res.locals.account.userName = 'Eugenio Pace';
  res.locals.account.namespace =  'eugeniopace.auth0.com';
  res.locals.account.clientId = 'ep-clientid';
  res.locals.account.clientSecret = 'ep-clientsecret';

  console.log(JSON.stringify(res.locals.account));
}
);

if (!module.parent) {
  docsapp.start(3000);
  console.log('Server listening on port 3000');
} else {
  module.exports = docsapp;
}
