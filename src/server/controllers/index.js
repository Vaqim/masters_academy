const authController = require('./authorization');
const taskController = require('./task');
const discountsController = require('./discounts');
const productsController = require('./products');
const colorsController = require('./colors');
const typesController = require('./types');

module.exports = {
  authController,
  taskController,
  discountsController,
  productsController,
  colorsController,
  typesController,
};
