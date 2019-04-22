const bcrypt = require("bcrypt-nodejs");

module.exports.compare = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

module.exports.genSalt = rounds => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(rounds, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

module.exports.hash = (password, salt) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, null, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};
