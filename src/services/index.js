const {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
} = require('./discounts');
const { csvToObjectStream } = require('./products');
const { isEmpty } = require('./utils');

module.exports = {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
  csvToObjectStream,
  isEmpty,
};
