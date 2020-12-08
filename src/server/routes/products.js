const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { productsController } = require('../controllers');

const product = Router();

product.put(
  '/upload',
  asyncHandler(async (req, res) => {
    try {
      await productsController.updateCsv(req);
      res.send('uploaded');
    } catch (error) {
      console.log(error.message || error);
      res.send('error').status(500);
    }
  }),
);

product.get(
  '/getFiles',
  asyncHandler(async (req, res) => {
    await productsController.getFiles(res);
  }),
);

product.post(
  '/upload/optimize',
  asyncHandler(async (req, res) => {
    await productsController.jsonOptimization(req.body, res);
  }),
);

module.exports = product;
