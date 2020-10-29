const { first: filterFunc, second: maxCost, third: formaterFunc } = require('./task');
const priceList = require('../input_array.json');

function boot(inputArray, param, value) {
  const filtered = filterFunc(inputArray, param, value);
  console.log(filtered);

  const formatted = formaterFunc(filtered);
  console.log(formatted);

  console.log(maxCost);
}

boot(priceList, 'type', 'socks');
