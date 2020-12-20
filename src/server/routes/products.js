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

product.post(
  '/create',
  asyncHandler(async (req, res) => {
    try {
      await productsController.createProductByParams(req.body, res);
    } catch (err) {
      console.error(err);
    }
  }),
);

product.get(
  '/read',
  asyncHandler(async (req, res) => {
    try {
      await productsController.getProductById(req.query, res);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }),
);

product.patch(
  '/update',
  asyncHandler(async (req, res) => {
    try {
      await productsController.updateProductByParams(req.body, res);
    } catch (err) {
      console.error(err);
    }
  }),
);

product.delete(
  '/delete',
  asyncHandler(async (req, res) => {
    try {
      productsController.deleteProductById(req.query, res);
    } catch (err) {
      console.error(err);
    }
  }),
);

module.exports = product;
