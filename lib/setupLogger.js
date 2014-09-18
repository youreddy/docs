var env     = process.env;
var winston = require("winston");
var url     = require('url');

winston.setLevels(winston.config.syslog.levels);

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, { 
  colorize: true, 
  level: env["CONSOLE_LOG_LEVEL"], 
  prettyPrint: true 
});

if(env['NODE_ENV'] === "production") {
  if(env['LOG_TO_WEB_URL']){
    var parsedLogToWebUrl = url.parse(env['LOG_TO_WEB_URL']);

    winston.add(winston.transports.Webhook, {
      host:   parsedLogToWebUrl.hostname,
      port:   parseInt(parsedLogToWebUrl.port || 80, 10),
      method: 'POST',
      path:   parsedLogToWebUrl.path,
      level:  env['LOG_TO_WEB_LEVEL'] || 'error',
      handleExceptions: true
    });
  }

}
