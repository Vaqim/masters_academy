const bodyParser = require('body-parser');
const express = require('express');
const { discounts, products, tasks, colors, types } = require('./routes');
const { authentication, errorHandler } = require('./middlewares');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(authentication);

app.use('/task', tasks);
app.use('/discount', discounts);
app.use('/products', products);
app.use('/colors', colors);
app.use('/types', types);

app.get('/', (req, res) => {
  res.send('Home page');
});

app.use(errorHandler);

module.exports = app;
