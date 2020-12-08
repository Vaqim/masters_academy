const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { productsController } = require('../controllers');

const product = Router();

product.put(
  '/upload',
  asyncHandler(async (req) => {
    await productsController.updateCsv(req);
  }),
);

product.get(
  '/getFiles',
  asyncHandler(async (req, res) => {
    await productsController.getFiles(res);
  }),
);

product.get(
  '/upload/optimize',
  asyncHandler(async (req, res) => {
    await productsController.jsonOptimization(req.body, res);
  }),
);

module.exports = product;
