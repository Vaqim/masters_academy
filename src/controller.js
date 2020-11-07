const { first: filter, second: maxCost, third: formatter } = require('./task');

function getFilter(res, queryParams) {
  console.log('getFilterCalled!');
  console.log(queryParams);
  res.end();
}

function getMaxCost(res) {
  console.log('getMaxCostCalled!');
  res.end();
}

function getFormatter(res) {
  console.log('getFormatterCalled!');
  res.end();
}

function notFound(res) {
  res.statusCode = 404;
  res.write('404 Not Found');
  res.end();
}

module.exports = { getFilter, getMaxCost, getFormatter, notFound };
