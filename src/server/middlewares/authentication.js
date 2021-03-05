const jwt = require('jsonwebtoken');
const { JWToken } = require('../../config');

function authentication(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1] || '';

  if (!token) throw new Error('Token required');

  jwt.verify(token, JWToken.accessSecret, (err, user) => {
    if (err) throw new Error('Token expired!');

    req.user = user;
    next();
  });
}

module.exports = authentication;
