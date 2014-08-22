var authorizations = require('./authorizations');
var winston        = require('winston');

module.exports = function (req, res, next) {
  if (req.user) {
    if (!req.user.tenant) return next();
    if (!('tenant_owner' in req.session) || req.session.tenant_owner.tenant !== req.user.tenant) {
      return authorizations.getTenantOwners(req.user.tenant, function (err, owners) {
          if (err) {
            winston.error('authorizations.getTenantOwners', { tenant: req.user.tenant, error: err });
            res.send(500);
          }
          
          req.session.tenant_owner = {
            is_owner: owners.some(function (o) { return o.id === req.user.id; } ),
            tenant:   req.user.tenant
          };

          req.user.is_owner = req.session.tenant_owner.is_owner;
          next();
        });
    } else {
      req.user.is_owner = req.session.tenant_owner.is_owner;
    }
  }
  next();
};
