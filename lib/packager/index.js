var _        = require('lodash'),
    nconf    = require('nconf'),
    url      = require('url'),
    request  = require('request');

module.exports = function (app, authenticatedVarsMiddleware) {
  if (nconf.get('PACKAGER_URL')) {
    app.get('/:repo/:branch/create-package', authenticatedVarsMiddleware, function(req, res) {
      if (req.query.clientId) {
        if (!res.locals.account) {
          return res.send(401, 'Unauthorized: You need to log in to be able to use a clientId');
        }

        var localClient = _.find(res.locals.account.clients, function(client) {
          return client.clientID === req.query.clientId;
        });

        if (!localClient) {
          return res.send(401, 'Unauthorized: You can\'t use a clientId that doesn\'t belong to you.')
        }
      }
      request(url.resolve(nconf.get('PACKAGER_URL'), req.url)).pipe(res);
    });
  }

};
