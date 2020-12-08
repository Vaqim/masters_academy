const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { discountsController } = require('../controllers');

const discount = Router();

discount.get('/discounts_callback', (req, res) => {
  discountsController.getDiscountCallback(res);
});

discount.get('/discounts_promise', (req, res) => {
  discountsController.getDiscountPromise(res);
});

discount.get(
  '/discounts_async',
  asyncHandler(async (req, res) => {
    discountsController.getDiscountCallback(res);
  }),
);

module.exports = discount;
