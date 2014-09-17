var default_callbacks = {
  'nodejs':        'http://localhost:CHANGE-TO-YOUR-PORT/callback',
  'rails':         'http://localhost:CHANGE-TO-YOUR-PORT/auth/auth0/callback',
  'ruby-on-rails': 'http://localhost:CHANGE-TO-YOUR-PORT/auth/auth0/callback',
  'nancyfx':       'http://localhost:CHANGE-TO-YOUR-PORT/login-callback',
  'laravel':       'http://localhost:CHANGE-TO-YOUR-PORT/auth0/callback',
  'symfony':       'http://localhost:CHANGE-TO-YOUR-PORT/auth0/callback',
  'ios':           'https://{tenant}.auth0.com/mobile',
  'android':       'https://{tenant}.auth0.com/mobile',
  'aspnet':        'http://localhost:CHANGE-TO-YOUR-PORT/LoginCallback.ashx',
  'aspnet-owin':   'http://localhost:CHANGE-TO-YOUR-PORT/signin-auth0',
  'php':           'http://localhost:CHANGE-TO-YOUR-PORT/callback.php',
  'python':        'http://localhost:CHANGE-TO-YOUR-PORT/callback',
  'win8':          'https://{tenant}.auth0.com/mobile',
  'azure':         'http://mysite.azurewebsites.net/LoginCallback.ashx',
  'servicestack':  'http://localhost:CHANGE-TO-YOUR-PORT/api/auth/auth0/',
  'windowsphone':  'https://{tenant}.auth0.com/mobile',
  'xamarin':       'https://{tenant}.auth0.com/mobile',
  'phonegap':      'https://{tenant}.auth0.com/mobile',
  'wpf-winforms':  'https://{tenant}.auth0.com/mobile',
  'spa':           'http://localhost:CHANGE-TO-YOUR-PORT/',
  'angular':       'http://localhost:CHANGE-TO-YOUR-PORT/',
  'java':          'http://localhost:CHANGE-TO-YOUR-PORT/callback'
};

exports.get = function (req) {
  if (!req.query.backend) return '';
  return default_callbacks[req.query.backend];
};