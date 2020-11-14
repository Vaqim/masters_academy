function isEmpty(source) {
  return Object.keys(source).length === 0 || source.length === 0;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = { isEmpty, getRandomInt };
