/**
 * Module dependencies.
 */

var collections = require('./quickstart-collections');
var apptypes = collections.apptypes;
var clientPlatforms = collections.clientPlatforms;
var nativePlatforms = collections.nativePlatforms;
var hybridPlatforms = collections.hybridPlatforms;
var serverPlatforms = collections.serverPlatforms;
var serverApis = collections.serverApis;
var debug = require('debug')('docs:quickstart-routes');

/**
 * Expose routes mapping
 */

var routes = module.exports = [];

apptypes.forEach(apptypesComposer);

function apptypesComposer(application) {
  // Compose and register base application
  // type route
  var route = '/' + application.name;
  routes.push(route);

  // According to application's type
  // compose the rest of
  if ('web' === application.name) return serverPlatforms.forEach(platformSingleComposer.bind(null, application));
  if ('spa' === application.name) return clientPlatforms.forEach(platformApiComposer.bind(null, application));
  if ('hybrid' === application.name) return hybridPlatforms.forEach(platformApiComposer.bind(null, application));
  if ('native-mobile' === application.name) return nativePlatforms.forEach(platformApiComposer.bind(null, application));
}

function platformSingleComposer(application, platform) {
  var route = '/' + application.name + '/' + platform.name;
  routes.push(route);
  debug('loaded route %s', route);
}

function platformApiComposer(application, platform) {
  // Mid way route
  platformSingleComposer(application, platform);
  // No API route
  apiCombinedComposer(application, platform, { name: 'no-api' })
  // API combined route
  serverApis.forEach(apiCombinedComposer.bind(null, application, platform));
}

function apiCombinedComposer(application, platform, api) {
  var route = '/' + application.name + '/' + platform.name + '/' + api.name;
  routes.push(route);
  debug('loaded route %s', route);
}
