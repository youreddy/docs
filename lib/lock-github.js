/**
 * Module dependencies.
 */

var request = require('request');
var base = 'https://rawgit.com/auth0/lock/master/'
module.exports = fetch;

function fetch(doc, cb) {

  request(base + doc, function (err, response, body) {
    if (err) return cb(err);
    if (response.statusCode !== 200) return cb(new Error('There was an error fetching ' + base + doc));

    fetch.cache[doc] = body;
    cb(null, fetch.cache[doc]);

  })

}

fetch.cache = {};
