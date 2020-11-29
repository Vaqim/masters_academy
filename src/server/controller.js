const fs = require('fs');
const path = require('path');

const { pipeline } = require('stream');
const { promisify } = require('util');
const { createGunzip } = require('zlib');
const { nanoid } = require('nanoid');

const { first: filter, second: maxCost, third: formatter } = require('../task');
const {
  isEmpty,
  discountCallback,
  amountOfDiscounts,
  discountPromise,
  repeatPromiseUntilResolve,
  discountPromisify,
  createCsvToJson,
  buildUniqJson,
  getFilesInfo,
} = require('../utils');
const inputArray = require('../../input_array.json');
const { env } = require('process');

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
        .reduce((acc, red) => acc * red);
      product.discount = `${((1 - product.discount) * 100).toFixed()}%`;
      newData.push(product);
      if (newData.length === data.length) res.end(JSON.stringify(newData));
      else return;
    }
  }

  data.forEach((product) => {
    discountCallback(callback, product);
  });
}

function getDiscountPromise(res) {
  const data = getSource().myMap((product) => {
    const amount = amountOfDiscounts(product);
    const discounts = [];
    for (let i = 0; i < amount; i++) discounts.push(repeatPromiseUntilResolve(discountPromise));
    return Promise.all(discounts).then((discountSet) => {
      product.discount = +discountSet
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red);
      product.discount = `${((1 - product.discount) * 100).toFixed()}%`;
      return product;
    });
  });

  Promise.all(data).then((result) => {
    res.end(JSON.stringify(result));
  });
}

async function getDiscountAsync(res) {
  try {
    let data = getSource().myMap(async (product) => {
      const amount = amountOfDiscounts(product);
      let discounts = [];
      for (let i = 0; i < amount; i++) discounts.push(repeatPromiseUntilResolve(discountPromisify));
      discounts = await Promise.all(discounts);
      discounts = +discounts
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red);
      product.discount = discounts;
      product.discount = `${((1 - product.discount) * 100).toFixed()}%`;
      return product;
    });

    data = await Promise.all(data);
    res.end(JSON.stringify(data));
  } catch (e) {
    console.log(e.message);
    res.statusCode = 500;
    res.end('Houston, we have a problem');
  }
}

const promisifiedPipeline = promisify(pipeline);

async function updateCsv(inputStream) {
  if (!fs.existsSync(process.env.UPLOADS)) fs.mkdirSync(process.env.UPLOADS);
  const gunzip = createGunzip();
  const filename = nanoid(10);
  const filePath = `${process.env.UPLOADS}/${filename}.json`;
  const outputStream = fs.createWriteStream(filePath);
  const csvToJson = createCsvToJson();

  try {
    await promisifiedPipeline(inputStream, gunzip, csvToJson, outputStream);
  } catch (error) {
    console.log('csv pipeline failed: ', error);
  }
}

async function postJsonOptimization(data, res) {
  const readStream = fs.createReadStream(`${process.env.UPLOADS}/${data.filename}`);
  const buildUniqJsonStream = buildUniqJson();
  const writeStream = fs.createWriteStream(`${process.env.OPTIMIZED}/${data.filename}`);

  try {
    res.statusCode = 202;
    res.end();
    await promisifiedPipeline(readStream, buildUniqJsonStream, writeStream);
  } catch (error) {
    console.log('streams error', error);
  }
}

async function getFiles(res) {
  const pathToUploads = process.env.UPLOADS;
  const pathToOptomized = process.env.OPTIMIZED;

  try {
    const filesList = await getFilesInfo(pathToUploads);
    const optFilesList = await getFilesInfo(pathToOptomized);

    res.end(JSON.stringify({ uploads: filesList, optimized: optFilesList }));
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.end('We have a problem :(');
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
  getDiscountPromise,
  getDiscountAsync,
  updateCsv,
  postJsonOptimization,
  getFiles,
};
