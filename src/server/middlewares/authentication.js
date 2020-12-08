const { login, password } = require('../../config');

function authentication(req, res, next) {
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [baseLogin, basePassword] = Buffer.from(b64auth, 'base64').toString().split(':');
  if (login === baseLogin && password === basePassword) {
    return next();
  }
  const err = new Error('Authorization required!');
  err.name = 'AuthorizationError';
  throw err;
}

module.exports = authentication;
