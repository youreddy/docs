var path     = require('path');
var fs     = require('fs');

var includes = {};

module.exports.init = function(p) {
  var files = fs.readdirSync(p);
  files.forEach(function(file) {
    var content = fs.readFileSync(path.join(p, file));
    includes[path.basename(file, '.md')] = content;
  });
}

module.exports.add = function(req, res, next) {
  res.locals.includes = includes;
  next();
}