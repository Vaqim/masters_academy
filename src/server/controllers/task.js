const { first: filter, second: maxCost, third: formatter } = require('../../services/task');
const { isEmpty } = require('../../services/utils');
const { getAllProducts, updateProduct } = require('../../db');

async function getFilter(res, queryParams) {
  const productsArray = await getAllProducts();
  if (Object.keys(queryParams).length === 0) {
    res.status(400).send('on query');
    return;
  }
  if (isEmpty(productsArray)) {
    res.status(204).send('nothing to filter');
    return;
  }
  const [key, value] = Object.entries(queryParams).flat();
  const filtered = filter(productsArray, key, value);

  res.json(JSON.stringify(filtered));
}

async function getMaxCost(res) {
  const productsArray = await getAllProducts();
  if (isEmpty(productsArray)) {
    res.status(204).end('JSON is empty');
    return;
  }
  const maxPrice = maxCost(productsArray);
  res.send(`The most expensive in JSON data: \n${JSON.stringify(maxPrice)}`);
}

async function format(res) {
  const productsArray = await getAllProducts();
  if (isEmpty(productsArray)) {
    res.status(204).send('nothing to format');
    return;
  }
  const formatted = formatter(productsArray);
  res.json(JSON.stringify(formatted));
}

async function showData(res) {
  const productsArray = await getAllProducts();
  res.json(JSON.stringify(productsArray));
}

async function edit(res, data) {
  if (!data.id) {
    res.send('no id in request');
    return false;
  }
  if (Object.keys(data).length === 0 || data.length === 0) {
    res.status(400).send('nothing to add');
    return false;
  }

  const updatedProduct = await updateProduct(data);

  res.send(JSON.stringify(updatedProduct));
}

module.exports = { getFilter, getMaxCost, format, showData, edit };
