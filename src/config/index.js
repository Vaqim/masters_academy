require('dotenv').config();
const { fatal } = require('../services/fatal');

const config = {
  port: process.env.PORT || 3000,
  origin: process.env.ORIGIN || 'http://localhost:3000/',
  login: process.env.LOGIN || '',
  password: process.env.PASSWORD || '',
  JWToken: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET || 'access_secret',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
    expiresIn: process.env.TOKEN_EXPIRES_IN || '30s',
  },
  db: {
    client: 'postgres',
    connection: {
      user: process.env.DB_USER || fatal('no DB_USER'),
      host: process.env.DB_HOST || fatal('no DB_HOST'),
      port: process.env.DB_PORT || fatal('no DB_PORT'),
      database: process.env.DB_NAME || fatal('no DB_NAME'),
      password: process.env.DB_PASS || fatal('no DB_PASS'),
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

module.exports = config;
