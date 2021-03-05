const { verify } = require('jsonwebtoken');
const {
  JWToken: { refreshSecret },
} = require('../../config');
const { getAccessToken, getRefreshToken } = require('../../services');

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) throw new Error('username/password required');

  const user = { username, password };

  const accessToken = getAccessToken(user);
  const refreshToken = getRefreshToken(user);

  res.json({ accessToken, refreshToken });
}

function refresh(req, res) {
  const refreshToken = req.body.token;
  if (!refreshToken) throw new Error('refresh token required');

  verify(refreshToken, refreshSecret, (err, user) => {
    if (err) throw new Error('Auth error!');

    const newAccessToken = getAccessToken({
      username: user.username,
      password: user.password,
    });

    res.json({ accessToken: newAccessToken });
  });
}

module.exports = {
  login,
  refresh,
};
