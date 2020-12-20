const { createGunzip } = require('zlib');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { csvToObjectStream } = require('../../services');
const { createProduct, getProduct, updateProduct, deleteProduct } = require('../../db');

const promisifiedPipeline = promisify(pipeline);

async function productsFromFileToDB(inputStream) {
  try {
    const gunzip = createGunzip();
    const csvStr = csvToObjectStream();
    await promisifiedPipeline(inputStream, gunzip, csvStr);
  } catch (error) {
    console.log('pipeline failed: ', error);
  }
}

async function createProductByParams(body, res) {
  try {
    const product = await createProduct(body);
    if (!product) {
      res.send('incorrect params').status(400);
      return false;
    }
    res.json(product);
    return true;
  } catch (error) {
    console.error(error);
    res.send('Oops..!').status(500);
  }
}

async function getProductById({ id }, res) {
  try {
    if (!id || !typeof +id === 'number') {
      res.send('incorrect request data').status(400);
      return false;
    }

    const product = await getProduct(id);
    if (!product) {
      res.send('product is not defined').status(404);
      return false;
    }

    res.json(product);
    return true;
  } catch (error) {
    console.error(error);
    res.send('Oops..!').status(500);
  }
}

async function updateProductByParams(body, res) {
  try {
    const product = await updateProduct(body);
    if (!product) {
      res.send('incorrect params').status(400);
      return false;
    }
    res.json(product);
    return true;
  } catch (error) {
    console.error(error);
    res.send(`incorrect input data: ${error.message}`).status(400);
  }
}

async function deleteProductById({ id }, res) {
  try {
    if (!id || !typeof +id === 'number') {
      res.send('incorrect request data').status(400);
      return false;
    }
    await deleteProduct(id);
    res.send('product deleted');
  } catch (error) {
    console.error(error);
    res.send('Oops..!').status(500);
  }
}

module.exports = {
  productsFromFileToDB,
  getProductById,
  createProductByParams,
  updateProductByParams,
  deleteProductById,
};
