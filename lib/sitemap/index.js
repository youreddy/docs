/**
 * Module dependencies.
 */

var fs = require('fs');
var ejs = require('ejs');
var lsr = require('lsr');
var path = require('path');
var resolve = path.resolve;
var read = fs.readFileSync;
var qsroutes = require('../quickstart-routes');
var tmplPath = __dirname + '/sitemap.xml.ejs';
var tmplString = read(tmplPath, 'utf8');
var sitemap = ejs.compile(tmplString);
var debug = require('debug')('docs:sitemap');

var urls = [];

/**
 * List all /docs documents urls in sitemap
 * discarding the ones already in sitemap list
 */

var docspath = resolve(__dirname, '../../docs');
var Doc = require('markdocs/lib/markdocs/doc');
var mockapp = {
  getDocsPath: function() {
    return docspath;
  }
};

function pathsFilter(relpath) {
  // avoid ./includes/ in sitemap.xml
  if (/^\.\/includes/.test(relpath)) {
    return false
  };

  return true;
}

lsr
.sync(docspath, { filterPath: pathsFilter })
.forEach(function(fileStat) {
  var filepath = fileStat.path;

  // skip if not markdown document
  if (!/\.md$/.test(filepath)) return;

  var doc = new Doc(mockapp, filepath);

  // skip if private document
  if (!doc.isPublic()) return;;

  // skip if already on the list
  if (~urls.indexOf(doc.getUrl())) return;

  debug('adding %s', doc.getUrl());
  urls.push(doc.getUrl());
});

/**
 * Add quickstart routes
 */

qsroutes.forEach(function(r) {
  var url = '/quickstart' + r;
  debug('adding %s', url);
  urls.push(url);
});

/**
 * Export `Express` app function wrapper
 */

module.exports = function (app) {
  app.get('/sitemap.xml', function (req, res) {
    res.set('Content-Type', 'application/xml');
    res.send(sitemap({ urls: urls }));
  });
};
