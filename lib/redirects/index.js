var urls = require('./redirect-urls');
var _ = require('lodash');

module.exports = function (app) {
  _.each(urls, function(urlInfo) {
    app.redirect(urlInfo.from, urlInfo.to, 301);
  });
};
