require('dotenv').config();
const { fatal } = require('../services/utils');

const config = {
  port: process.env.PORT || 3000,
  origin: process.env.ORIGIN || 'http://localhost:3000/',
  login: process.env.LOGIN || '',
  password: process.env.PASSWORD || '',
  db: {
    user: process.env.DB_USER || fatal('no DB_USER'),
    host: process.env.DB_HOST || fatal('no DB_HOST'),
    port: process.env.DB_PORT || fatal('no DB_PORT'),
    database: process.env.DB_NAME || fatal('no DB_NAME'),
    password: process.env.DB_PASS || fatal('no DB_PASS'),
  },
};

module.exports = config;
