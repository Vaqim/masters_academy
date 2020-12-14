const { Transform } = require('stream');
const { createProduct } = require('../db');

function objectGenerator(inputArray, keys) {
  const objArray = [];
  inputArray.forEach((str) => {
    const object = {};
    str.split(',').forEach((e, i) => {
      switch (true) {
        case !isNaN(+e):
          e = +e;
          break;
        case e === 'true':
          e = true;
          break;
        case e === 'false':
          e = false;
          break;
        default:
          e;
      }
      object[keys[i]] = e;
    });
    objArray.push(object);
  });
  return objArray;
}

function getUniqProducts(store, objectArray) {
  objectArray.forEach((e) => {
    let str = Object.entries(e);
    str.splice(2, 1);
    str = str.toString();

    if (store[str]) store[str].quantity += e.quantity;
    else store[str] = e;
  });
}

function csvToObjectStream() {
  let isFirst = true;
  let keys = [];
  let lastStr = '';
  const uniqStore = [];

  const transform = (chunk, encoding, callback) => {
    const strArray = chunk.toString().split('\n');

    strArray[0] = lastStr + strArray[0];
    lastStr = strArray.pop();

    if (isFirst) {
      keys = strArray.shift().split(',');
      isFirst = false;
    }

    getUniqProducts(uniqStore, objectGenerator(strArray, keys));
    callback(null, null);
  };

  const flush = (callback) => {
    Object.values(uniqStore).forEach(async (e) => {
      await createProduct(e);
    });
    callback(null, null);
  };

  return new Transform({ transform, flush });
}

module.exports = { csvToObjectStream };
