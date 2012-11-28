var mdoc = require('node-mdoc');
var docsapp = new mdoc.App();

if (!module.parent) {
  docsapp.start(3000);
  console.log('Server listening on port 3000');
} else {
  module.exports = docsapp;
}