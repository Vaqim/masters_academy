function isEmpty(source) {
  return Object.keys(source).length === 0;
}

function fatal(message) {
  console.error('fatal: ', message);
  process.exit(1);
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
  fatal,
};
