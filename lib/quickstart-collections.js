/**
 * Module dependencies.
 */

exports.apptypes = require('auth0-application-types');
exports.clientPlatforms = require('auth0-client-platforms');
exports.nativePlatforms = require('auth0-native-platforms');
exports.hybridPlatforms = exports.nativePlatforms.filter(hybridFilter);
exports.serverPlatforms = require('auth0-server-platforms');
exports.serverApis = require('auth0-server-apis');

/**
 * Filters hybrid platforms out of native platforms
 *
 * @param {Object} platform
 * @return {Boolean}
 * @private
 */

function hybridFilter(platform) {
  return !!platform.hybrid
};
