const { Router } = require('express');
const {
  authController: { login, refresh },
} = require('../controllers');

const auth = new Router();

auth.post('/login', (req, res) => login(req, res));
auth.post('/refresh', (req, res) => refresh(req, res));

module.exports = auth;
