const util = require('util');
const { Transform } = require('stream');

function isEmpty(source) {
  return Object.keys(source).length === 0 || source.length === 0;
}

function generateSale() {
  const sale = Math.floor(Math.random() * Math.floor(99));
  if (sale >= 20) throw new Error('sale is greater then 20');
  return sale;
}

function discountCallback(callback, prod) {
  setTimeout(() => {
    try {
      callback(null, generateSale(), prod);
    } catch (e) {
      callback(e, null, prod);
    }
  }, 50);
}

function discountPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(generateSale());
      } catch (error) {
        reject(error.message);
      }
    }, 50);
  });
}

function repeatPromiseUntilResolve(fn) {
  return fn()
    .then((res) => res)
    .catch(() => repeatPromiseUntilResolve(fn));
}

function amountOfDiscounts(prod) {
  const { type, color } = prod;
  switch (true) {
    case type === 'hat' && color === 'red':
      return 3;
    case type === 'hat':
      return 2;
    default:
      return 1;
  }
}

const discountPromisify = util.promisify(discountCallback);

function jsonGenerator(inputArray, keys) {
  return inputArray.reduce((acc, red) => {
    let jsonString = red.split(',').map((e, i) => {
      if (!(!isNaN(+e) || e === 'true' || e === 'false')) e = `"${e}"`;
      return ` "${keys[i]}": ${e}`;
    });
    jsonString = `,\n\t{${jsonString} }`;
    return acc + jsonString;
  }, '');
}

function createCsvToJson() {
  let isFirst = true;
  let keys = [];
  let lastStr = '';

  const transform = (chunk, encoding, callback) => {
    const strArray = chunk.toString().split('\n');

    strArray[0] = lastStr + strArray[0];
    lastStr = strArray.pop();

    if (isFirst) {
      keys = strArray.shift().split(',');
      const str = jsonGenerator(strArray, keys);
      callback(null, `[${str.slice(1)}`);
      isFirst = false;
      return;
    }

    const str = jsonGenerator(strArray, keys);
    callback(null, str);
  };

  const flush = (callback) => {
    callback(null, '\n]');
  };

  return new Transform({ transform, flush });
}

function getUniqProducts(store, chunk) {
  chunk.forEach((line) => {
    if (line === '[' || line === ']') return;
    if (line[line.length - 1] === ',') line = line.slice(0, -1);
    line = line.trim();
    const product = JSON.parse(line);

    let str = Object.entries(product);
    str.splice(2, 1);

    str = str.toString();

    if (store[str]) store[str].quantity += product.quantity;
    else store[str] = product;
  });
}

function buildUniqJson() {
  let lastStr = '';
  let uniqProducts = {};

  const transform = (chunk, encoding, callback) => {
    const strArray = chunk.toString().split('\n');
    strArray[0] = lastStr + strArray[0];
    lastStr = strArray.pop();

    getUniqProducts(uniqProducts, strArray);
    console.log(uniqProducts);
    const uniqProductsObjects = Object.values(uniqProducts);

    callback(null, JSON.stringify(uniqProductsObjects));
  };

  const flush = (callback) => {
    callback(null, '');
  };

  return new Transform({ transform, flush });
}

// eslint-disable-next-line no-extend-native
Array.prototype.myMap = function (callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

module.exports = {
  isEmpty,
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
  createCsvToJson,
  buildUniqJson,
};
