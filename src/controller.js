const fs = require('fs');
const path = require('path');
const { first: filter, second: maxCost, third: formatter } = require('./task');
const {
  isEmpty,
  discountCallback,
  amountOfDiscounts,
  discountPromise,
  repeatPromiseUntilResolve,
  discountPromisify,
} = require('./utils');
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
    if (Array.isArray(product.discount)) product.discount.push(value);
    else product.discount = [value];

    amount = amountOfDiscounts(product);

    if (Array.isArray(product.discount) && product.discount.length < amount) {
      discountCallback(callback, product);
    } else {
      product.discount = +product.discount
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red)
        .toFixed(2);
      newData.push(product);
      if (newData.length !== data.length) return;
      res.end(JSON.stringify(newData));
    }
  }
}

function getDiscountPromise(res) {
  const data = getSource().myMap((product) => {
    const amount = amountOfDiscounts(product);
    const discounts = [];
    for (let i = 0; i < amount; i++) discounts.push(repeatPromiseUntilResolve(discountPromise));
    return Promise.all(discounts).then((discountSet) => {
      product.discount = +discountSet
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red)
        .toFixed(2);
      return product;
    });
  });

  Promise.all(data).then((result) => {
    res.end(JSON.stringify(result));
  });
}

async function getDiscountAsync(res) {
  let data = getSource().myMap(async (product) => {
    const amount = amountOfDiscounts(product);
    let discounts = [];
    for (let i = 0; i < amount; i++) discounts.push(repeatPromiseUntilResolve(discountPromisify));
    discounts = await Promise.all(discounts);
    discounts = +discounts
      .map((discount) => (100 - discount) / 100)
      .reduce((acc, red) => acc * red)
      .toFixed(2);
    product.discount = discounts;
    return product;
  });

  data = await Promise.all(data);
  res.end(JSON.stringify(data));
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
  getDiscountPromise,
  getDiscountAsync,
};
