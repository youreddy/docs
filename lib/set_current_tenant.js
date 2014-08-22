var winston        = require('winston');
var authorizations = require('./authorizations');

// - set req.session.current_tenant to switch account
// - delete req.session.current_tenant to switch to default account
// - delete req.session.current_tenants to refresh req.user.tenants list
module.exports = function (req, res, next) {
  var done = function () {
    req.user.tenants = req.session.current_tenants;

    if (req.user.tenants.length === 0) {
      // new user
      delete req.user.tenant;
      return next();
    }

    var is_valid = function (t) {
      return t && req.user.tenants.indexOf(t) > -1;
    };

    var tenant = req.session.current_tenant || req.user.default_tenant;
    
    req.user.tenant = is_valid(tenant) ? tenant : req.user.tenants[0];
    req.session.current_tenant = req.user.tenant;

    winston.info('Current tenant is: ' + req.user.tenant);
    winston.info('Tenants list', req.user.tenants);
    
    next();
  };

  if (!req.user) { return next(); }
  if (req.session.current_tenants) { return done(); }

  authorizations.getUserTenants(req.user.id, function (err, tenants) {
    if (err) {
      winston.error('get user tenants error: ' + err.message);
      return res.send(500, err.message);
    }
    
    req.session.current_tenants = tenants || [];
    done();
  });
};
