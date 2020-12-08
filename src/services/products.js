const fs = require('fs');
const { Transform } = require('stream');
const { promisify } = require('util');
const path = require('path');

function jsonGenerator(inputArray, keys) {
  return inputArray.reduce((acc, red) => {
    let jsonString = red.split(',').map((e, i) => {
      if (!(!isNaN(+e) || e === 'true' || e === 'false')) e = `"${e}"`;
      return `"${keys[i]}":${e}`;
    });

    if (jsonString[4] === '"isPair":true') {
      jsonString[3] = `"priceForPair":${jsonString[3].split(':')[1]}`;
    }
    jsonString.length -= 1;
    jsonString = `,\n\t{${jsonString}}`;
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
  let chunkQuantity = 0;
  chunk.forEach((line) => {
    if (line === '[' || line === ']') return;
    if (line[line.length - 1] === ',') line = line.slice(0, -1);
    line = line.trim();
    const product = JSON.parse(line);

    chunkQuantity += product.quantity;

    let str = Object.entries(product);
    str.splice(2, 1);
    str = str.toString();

    if (store[str]) store[str].quantity += product.quantity;
    else store[str] = product;
  });
  return chunkQuantity;
}

function buildUniqJson() {
  let lastStr = '';
  const uniqProducts = {};
  let uniqProductsString = '[\n';
  let amountOfProducts = 0;

  const transform = (chunk, encoding, callback) => {
    const strArray = chunk.toString().split('\n');
    strArray[0] = lastStr + strArray[0];
    lastStr = strArray.pop();

    amountOfProducts += getUniqProducts(uniqProducts, strArray);

    callback(null, null);
  };

  const flush = (callback) => {
    const values = Object.values(uniqProducts);
    values.forEach((e, i) => {
      if (i === values.length - 1) {
        uniqProductsString += `\t${JSON.stringify(e)}\n`;
        return;
      }
      uniqProductsString += `\t${JSON.stringify(e)},\n`;
    });
    callback(null, `${uniqProductsString}]`);
    console.log(`Optimization done!\nTotal quantity: ${amountOfProducts}`);
  };
  return new Transform({ transform, flush });
}

async function getFilesInfo(pathToDir) {
  const statPromisified = promisify(fs.stat);
  const readdirPromisified = promisify(fs.readdir);

  let files = await readdirPromisified(pathToDir);
  files = files
    .filter((file) => file.split('.').length >= 2)
    .map(async (file) => {
      const { size, birthtime } = await statPromisified(path.join(pathToDir, file));
      return { filename: file, size, birthtime };
    });
  return Promise.all(files);
}

module.exports = { createCsvToJson, buildUniqJson, getFilesInfo };
