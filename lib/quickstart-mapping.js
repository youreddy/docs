/**
 * Module dependencies.
 */

var apptypes = require('auth0-application-types');
var clientPlatforms = require('auth0-client-platforms');
var nativePlatforms = require('auth0-native-platforms');
var hybridFilter = function (i) { return !!i.hybrid };
var hybridPlatforms = nativePlatforms.filter(hybridFilter);
var serverPlatforms = require('auth0-server-platforms');
var serverApis = require('auth0-server-apis');
var debug = require('debug')('docs:quickstart-mappings');

/**
 * Expose routes mapping
 */

var routes = module.exports = [];

apptypes.forEach(apptypesMap);

function apptypesMap(application) {
  if ('web' === application.name) return serverPlatforms.forEach(platformSingleMap.bind(null, application));
  if ('spa-api' === application.name) return clientPlatforms.forEach(platformApiMap.bind(null, application));
  if ('hybrid' === application.name) return hybridPlatforms.forEach(platformApiMap.bind(null, application));
  if ('native-mobile' === application.name) return nativePlatforms.forEach(platformApiMap.bind(null, application));
}

function platformSingleMap(application, platform) {
  var route = '/' + application.name + '/' + platform.name;
  routes.push(route);
  debug('loaded route %s', route);
}

function platformApiMap(application, platform) {
  var route = '/' + application.name + '/' + platform.name + '/no-api';
  routes.push(route);
  debug('loaded route %s', route);
  serverApis.forEach(apiCombinedMap.bind(null, application, platform));
}

function apiCombinedMap(application, platform, api) {
  var route = '/' + application.name + '/' + platform.name + '/' + api.name;
  routes.push(route);
  debug('loaded route %s', route);
}
