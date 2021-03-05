const {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
} = require('./discounts');
const { csvToObjectStream } = require('./products');
const { isEmpty } = require('./utils');
const { getAccessToken, getRefreshToken } = require('./authorization');

module.exports = {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
  csvToObjectStream,
  isEmpty,
  getAccessToken,
  getRefreshToken,
};
