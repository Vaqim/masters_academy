function firstTask(inputArray, param, value) {
  return inputArray.filter((e) => e[param] == value || e[param] === undefined);
}

module.exports = firstTask;
