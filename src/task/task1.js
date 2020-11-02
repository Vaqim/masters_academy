function firstTask(inputArray, param, value) {
  return inputArray.filter((e) => e[param] === value);
}

module.exports = firstTask;
