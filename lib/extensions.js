/**
 * Module dependencies.
 */

var lodash = require('lodash');

/**
* Add mixins
*/
lodash.mixin({
  capitalize : function(string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }
});

/**
 * Expose extensions
 */

exports.lodash = lodashExtension;

/**
 * Lodash Pre-compile extension
 *
 * @param {Object} context
 * @return {Function} Showdown extension
 * @api public
 */

function lodashExtension(context) {
  // Ugly ugly ugly!
  // But it's how showdown works...
  return function lodashCompiler(converter) {
    return [{
      type: 'lang',
      filter: function (text) {
        return context.meta.lodash
          ? lodash.template(text)(context)
          : text;
      }
    }];
  }
}
