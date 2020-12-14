const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { productsController } = require('../controllers');

const product = Router();

product.put(
  '/upload',
  asyncHandler(async (req, res) => {
    try {
      console.log('accepted');
      await productsController.productsFromFileToDB(req);
      res.send('uploaded');
    } catch (error) {
      console.log(error.message || error);
      res.send('error').status(500);
    }
  }),
);

module.exports = product;
