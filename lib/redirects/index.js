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
};
