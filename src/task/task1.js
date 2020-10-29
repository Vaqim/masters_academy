const arr = require('../../input_array');

function firstTask(inputArray, param, value) {
  return inputArray.filter((e) => e[param] === value);
}

console.log(arr);
console.log(firstTask(arr, 'color', 'red'));

module.exports = firstTask;
