const fs = require('fs');
const path = require('path');
const { first: filter, second: maxCost, third: formatter } = require('../../services/task');
const { isEmpty } = require('../../services/utils');

const productsArray = require('../../../input_array.json');

function getFilter(res, queryParams) {
  console.log(queryParams);
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

function getMaxCost(res) {
  if (isEmpty(productsArray)) {
    res.status(204).end('JSON is empty');
    return;
  }
  const maxPrice = maxCost(productsArray);
  res.send(`The most expensive in JSON data: \n${JSON.stringify(maxPrice)}`);
}

function format(res) {
  if (isEmpty(productsArray)) {
    res.status(204).send('nothing to format');
    return;
  }
  const formatted = formatter(productsArray);
  res.json(JSON.stringify(formatted));
}

function showData(res) {
  res.json(JSON.stringify(productsArray));
}

function edit(res, data) {
  if (Object.keys(data).length === 0 || !Array.isArray(data) || data.length === 0) {
    res.status(400).send('nothing to add');
    return;
  }

  fs.writeFileSync(path.resolve(`${__dirname}../../`, 'input_array.json'), JSON.stringify(data));

  res.write('new data in JSON\n');
  res.end(JSON.stringify(productsArray));
}

module.exports = { getFilter, getMaxCost, format, showData, edit };
