const jwt = require('jsonwebtoken');
const { JWToken } = require('../config');

function getAccessToken(data) {
  return jwt.sign(data, JWToken.accessSecret, { expiresIn: JWToken.expiresIn });
}

function getRefreshToken(data) {
  return jwt.sign(data, JWToken.refreshSecret);
}

module.exports = {
  getAccessToken,
  getRefreshToken,
};
