/**
 * Expose middlewares
 */

exports.configuration = configurationMiddleware;

/**
 * Parse `configuration` local from `query` parameters
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @api public
 */

function configurationMiddleware (req, res, next) {
  // used by lodash extension
  res.locals.configuration = res.locals.configuration || {};

  next();
}
