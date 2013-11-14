var crypto  = require('crypto');

exports.decryptAesSha256 = function (key, encryptedText) {
  try {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    if (e.name !== 'TypeError') throw e;
  }

  return encryptedText;
};
