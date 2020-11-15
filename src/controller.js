const fs = require('fs');
const path = require('path');
const util = require('util');
const { first: filter, second: maxCost, third: formatter } = require('./task');
const { isEmpty, repeatPromiseUntilResolve, saleCallback, salePromise } = require('./utils');
const inputArray = require('../input_array.json');

let store = [];
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

const salePromisify = util.promisify(saleCallback);

function getSaleCallback() {
  const data = getSource();
  const result = data.myMap((product) => {
    let sale;
    saleCallback((err, value) => {
      if (err) {
        console.log('err', err.message);
        return err;
      }
      sale = value;
      return value;
    });
    product.sale = sale;
    return product;
  });
  console.log(result);
}

function getSalePromise(res) {
  let data = getSource();

  data = data.myMap((product) => {
    return repeatPromiseUntilResolve(salePromise).then((sale) => {
      product.sale = sale;
      return product;
    });
  });

  Promise.all(data).then((result) => {
    console.log(result);
    res.end();
  });
}

async function getSaleAsync(res) {
  let data = getSource();
  data = data.myMap(async (product) => {
    const sale = await repeatPromiseUntilResolve(salePromisify);
    product.sale = sale;
    return product;
  });
  data = await Promise.all(data);
  console.log(data);
  res.end();
}

module.exports = {
  getFilter,
  getMaxCost,
  getFormatter,
  notFound,
  postSwitchSource,
  getShowData,
  postEdit,
  getSaleCallback,
  getSalePromise,
  getSaleAsync,
};
