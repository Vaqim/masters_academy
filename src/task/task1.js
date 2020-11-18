function firstTask(inputArray, param, value) {
  return inputArray.filter((e) => e[param] == value || (e[param] === undefined && value == 0));
}

module.exports = firstTask;
