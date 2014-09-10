var urls = require('./redirect-urls');
var _ = require('lodash');

module.exports = function (app) {
  _.each(urls, function(urlInfo) {
    app.redirect(urlInfo.from, urlInfo.to, 301);
  });

  app.get(/^\/new\/(.+)/i, function(req, res, next) {
    var url = req.url.replace(/^\/new/, '');
    res.redirect(301, url);
  });

  // 301 for client-platform spa renamed to javascript
  app.redirect('/quickstart/spa/spa', '/quickstart/spa/javascript', 301);
  app.redirect('/quickstart/spa/spa/:api', '/quickstart/spa/javascript/:api', 301);

  // 301 for apptype web renamed to webapp
  app.redirect('/quickstart/web', '/quickstart/webapp', 301);
  app.redirect('/quickstart/web/:platform', '/quickstart/webapp/:platform', 301);

  // 301 for server-api ror-api renamed to rails-api
  app.redirecT('/quickstart/:apptype/:platform/ror-api', '/quickstart/:apptype/:platform/rails-api', 301);
};
