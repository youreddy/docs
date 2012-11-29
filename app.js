var mdoc = require('node-mdoc');
var docsapp = new mdoc.App();

if (!module.parent) {
  var port = process.env.PORT || 3000;
  docsapp.start(port);
  console.log('Server listening on port ' + port);
} else {
  module.exports = docsapp;
}