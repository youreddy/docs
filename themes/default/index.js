var nconf = require('nconf');

var Theme = function(docsapp) {
  this._docsapp = docsapp;
  docsapp.addPreRender(this._preRender.bind(this));
};

Theme.prototype._preRender = function(request, response, next) {
  var settings = this._docsapp.getSettings();
  var sections = response.doc.getSections();
  var title = response.doc.getMeta()['title'] || alternative_title(sections.content);

  response.locals.site = response.locals.site || {};
  response.locals.site.title = settings['title'] || 'Default';
  response.locals.site.menus = settings['menus'] || {};
  response.locals.title = title;
  response.locals.env = {
    AUTH0_DOMAIN:         nconf.get('AUTH0_DOMAIN'),
    AUTH0_CLIENT_ID:      nconf.get('AUTH0_CLIENT_ID'),
    DOMAIN_URL_SERVER:    nconf.get('DOMAIN_URL_SERVER')
  };
  
  next();
};

module.exports = Theme;

/**
 * Matches an alternative
 * title from the content
 *
 * @param {String} content
 * @return {String} title
 * @api private
 */

function alternative_title (content) {
  var regex = /\#{1}[^\n\#]+/g;
  var match = content.match(regex);

  if (match && match.length) match = match[0].slice(1).trim();

  return match || 'Document';
}