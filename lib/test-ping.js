var nconf = require('nconf');

module.exports = function (req, res) {
  var result = process.memoryUsage();

  if (!nconf.get('db')) {
    return res.json(200, result);
  }

  var ping_check = setTimeout(function () {
    winston.error('cant connect to the database (/test mongo ping timedout)');
    res.send(500, 'cann\'t connect to the database');
    process.exit(1);
  }, 15000);

  getDb(function (db) {
    db.command({ping: 1}, function (err) {
      clearTimeout(ping_check);
      if (err) {
        winston.error('cant connect to the database (/test)');
        res.send(500, 'cann\'t connect to the database');
      }
      result['db status'] = 'ok';
      return res.json(200, result);
    });
  });
};