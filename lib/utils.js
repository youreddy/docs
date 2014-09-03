var utils = module.exports;

var crypto  = require('crypto');
var nconf   = require('nconf');

var constant_time_compare = function (val1, val2) {
  if (val1.length !== val2.length) { return false; }
  var sentinel;
  for (var i = 0; i <= (val1.length - 1); i++) {
    sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
  }
  return sentinel === 0;
};

var decryptAesSha256V2 = function (key, cipher_text) {
  var cipher_blob = cipher_text.split('$'); // version $ cipher_text $ iv $ hmac
  if (cipher_blob.length !== 4) {
    throw new Error('Malformed encrypted blob');
  }
  
  var ct    = cipher_blob[1];
  var iv    = new Buffer(cipher_blob[2], 'hex');
  var hmac  = cipher_blob[3];

  var chmac = crypto.createHmac('sha256', nconf.get('HMAC_ENCRYPTION_KEY'));
  chmac.update(ct);
  chmac.update(iv.toString('hex'));

  if (!constant_time_compare(chmac.digest('hex'), hmac)) {
    throw new Error('Encrypted Blob has been tampered');
  }
  
  var key_hash = crypto.createHash('md5').update(key).digest('hex'); // we need a 32-byte key
  
  try {
    var decryptor = crypto.createDecipheriv('aes-256-cbc', key_hash, iv);
    var decrypted = decryptor.update(ct, 'hex', 'utf8');
    decrypted += decryptor.final('utf8');
    return decrypted;
  } catch (e) {
    throw e;
  }
};

var decryptAesSha256V1 = function (key, cipher_text, ignoreErrorIfTextIsNotEncrypted) {
  try {
    var decryptor = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decryptor.update(cipher_text, 'hex', 'utf8');
    decrypted += decryptor.final('utf8');
    return decrypted;
  } catch (e) {
    // decryptor will throws TypeError when specified text is not encrypted
    if (e.name !== 'TypeError' || !ignoreErrorIfTextIsNotEncrypted) {
      throw e;
    }
  }

  return cipher_text;
};

utils.decryptAesSha256 = function (key, cipher_text, ignoreErrorIfTextIsNotEncrypted) {
  var cipher_blob = cipher_text.split('$'); // version $ cipher_text $ iv $ hmac
  var version = cipher_blob[0];
  
  switch (version) {
  case '2.0':
    return decryptAesSha256V2(key, cipher_text);
  default:
    return decryptAesSha256V1(key, cipher_text, ignoreErrorIfTextIsNotEncrypted);
  }
};
