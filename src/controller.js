const fs = require('fs');
const path = require('path');
const { first: filter, second: maxCost, third: formatter } = require('./task');
const inputArray = require('../input_array.json');

let store = [];
let defaultSource = true;

function getSource() {
  return defaultSource ? inputArray : store;
}

function getFilter(res, queryParams) {
  if (Object.keys(queryParams).length === 0) {
    res.end('on query');
    return;
  }
  const [key, value] = Object.entries(queryParams).flat();
  const filtered = filter(getSource(), key, value);

  res.write('filtered data');
  res.end(JSON.stringify(filtered));
}

function getMaxCost(res) {
  const maxPrice = maxCost(getSource());
  res.end(
    `The most expensive in ${defaultSource ? 'JSON' : 'store'} data: ${JSON.stringify(maxPrice)}`,
  );
}

function getFormatter(res) {
  const formatted = formatter(getSource());
  res.write(`formatted ${defaultSource ? 'JSON' : 'store'} data: `);
  res.end(JSON.stringify(formatted));
}

function notFound(res) {
  res.statusCode = 404;
  res.write('404 Not Found');
  res.end();
}

function getSwitchSource(res) {
  defaultSource = !defaultSource;
  res.end(`source switched to ${defaultSource ? 'JSON' : 'store'}`);
}

function getShowData(res) {
  res.write(`current data source ${defaultSource ? 'JSON' : 'store'}\n`);
  res.end(JSON.stringify(getSource()));
}

function postEdit(res, data) {
  if (Object.keys(data).length === 0 || data.length === 0) {
    res.end('nothing to add');
    return;
  }
  if (!defaultSource) {
    store = data;
  } else {
    fs.writeFileSync(path.resolve(`${__dirname}../../`, 'input_array.json'), JSON.stringify(data));
  }
  res.write(`new data in ${defaultSource ? 'JSON' : 'store'}\n`);
  res.write(JSON.stringify(getSource()));
  res.end();
}

module.exports = {
  getFilter,
  getMaxCost,
  getFormatter,
  notFound,
  getSwitchSource,
  getShowData,
  postEdit,
};
