const {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
} = require('./discounts');
const { createCsvToJson, buildUniqJson, getFilesInfo } = require('./products');
const { fatal, isEmpty } = require('./utils');

module.exports = {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
  createCsvToJson,
  buildUniqJson,
  getFilesInfo,
  isEmpty,
  fatal,
};
