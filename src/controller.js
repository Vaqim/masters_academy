const fs = require('fs');
const path = require('path');
const util = require('util');
const { first: filter, second: maxCost, third: formatter } = require('./task');
const { isEmpty, discountCallback, amountOfDiscounts } = require('./utils');
const inputArray = require('../input_array.json');

let store = [
  { type: 'socks', color: 'red', quantity: 10, priceForPair: '$3' },
  { type: 'socks', color: 'green', quantity: 5, priceForPair: '$10' },
  { type: 'socks', color: 'blue', quantity: 8, priceForPair: '$6' },
  { type: 'hat', color: 'red', quantity: 7, price: '$5' },
  { type: 'hat', color: 'blue', quantity: 0, price: '$6' },
  { type: 'socks', color: 'blue', priceForPair: '$6' },
  { type: 'socks', color: 'green', quantity: 10, priceForPair: '$30' },
  { type: 'socks', color: 'white', quantity: 3, priceForPair: '$4' },
  { type: 'socks', color: 'blue', priceForPair: '$10' },
  { type: 'socks', color: 'green', quantity: 2, priceForPair: '$6' },
  { type: 'hat', color: 'blue', quantity: 3, price: '$5' },
  { type: 'hat', color: 'red', quantity: 1, price: '$6' },
  { type: 'socks', color: 'blue', priceForPair: '$6' },
];
let defaultSource = false;

function getSource() {
  return defaultSource ? inputArray : store;
}

function getFilter(res, queryParams) {
  if (Object.keys(queryParams).length === 0) {
    res.statusCode = 400;
    res.end('on query');
    return;
  }
  if (isEmpty(getSource())) {
    res.statusCode = 204;
    res.end('nothing to filter');
    return;
  }
  const [key, value] = Object.entries(queryParams).flat();
  const filtered = filter(getSource(), key, value);

  res.write('filtered data:\n');
  res.end(JSON.stringify(filtered));
}

function getMaxCost(res) {
  if (isEmpty(getSource())) {
    res.statusCode = 204;
    res.end(`${defaultSource ? 'JSON' : 'store'} is empty`);
    return;
  }
  const maxPrice = maxCost(getSource());
  res.end(
    `The most expensive in ${defaultSource ? 'JSON' : 'store'} data: \n${JSON.stringify(maxPrice)}`,
  );
}

function getFormatter(res) {
  if (isEmpty(getSource())) {
    res.statusCode = 204;
    res.end('nothing to format');
    return;
  }
  const formatted = formatter(getSource());
  res.write(`formatted ${defaultSource ? 'JSON' : 'store'} data: \n`);
  res.end(JSON.stringify(formatted));
}

function notFound(res) {
  res.statusCode = 404;
  res.end('404 Not Found');
}

function postSwitchSource(res) {
  defaultSource = !defaultSource;
  res.end(`source switched to ${defaultSource ? 'JSON' : 'store'}`);
}

function getShowData(res) {
  console.log(getSource());
  res.write(`current data source ${defaultSource ? 'JSON' : 'store'}\n`);
  res.end(JSON.stringify(getSource()));
}

function postEdit(res, data) {
  if (Object.keys(data).length === 0 || !Array.isArray(data) || data.length === 0) {
    res.statusCode = 400;
    res.end('nothing to add');
    return;
  }
  if (!defaultSource) {
    store = data;
  } else {
    fs.writeFileSync(path.resolve(`${__dirname}../../`, 'input_array.json'), JSON.stringify(data));
  }
  res.write(`new data in ${defaultSource ? 'JSON' : 'store'}\n`);
  res.end(JSON.stringify(getSource()));
}

function getDiscountCallback(res) {
  const data = getSource();
  const newData = [];
  let amount;

  data.forEach((product) => {
    discountCallback(callback, product);
  });

  function callback(err, value, product) {
    if (err) {
      return discountCallback(callback, product);
    }
    callback2(value, product);
  }

  function callback2(value, product) {
    if (Array.isArray(product.discount)) product.discount.push(value);
    else product.discount = [value];

    amount = amountOfDiscounts(product);

    if (Array.isArray(product.discount) && product.discount.length < amount) {
      discountCallback(callback, product);
    } else {
      newData.push(product);
      callback3(product);
    }
  }

  function callback3() {
    if (newData.length !== data.length) return;
    console.log(newData);
    res.end();
  }
}

module.exports = {
  getFilter,
  getMaxCost,
  getFormatter,
  notFound,
  postSwitchSource,
  getShowData,
  postEdit,
  getDiscountCallback,
};
