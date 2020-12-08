require('dotenv').config();
const { fatal } = require('../services');

const config = {
  port: process.env.PORT || 3000,
  origin: process.env.ORIGIN || 'http://localhost:3000/',
  uploads: process.env.UPLOADS || fatal('no uploads path'),
  optimized: process.env.OPTIMIZED || fatal('no optimized path'),
  login: process.env.LOGIN || '',
  password: process.env.PASSWORD || '',
};

module.exports = config;
