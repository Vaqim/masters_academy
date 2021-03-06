const util = require('util');

function generateSale() {
  const sale = Math.floor(Math.random() * Math.floor(99));
  if (sale >= 20) throw new Error('sale is greater then 20');
  return sale;
}

function discountCallback(callback, prod) {
  setTimeout(() => {
    try {
      callback(null, generateSale(), prod);
    } catch (e) {
      callback(e, null, prod);
    }
  }, 50);
}

function discountPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(generateSale());
      } catch (error) {
        reject(error.message);
      }
    }, 50);
  });
}

function repeatPromiseUntilResolve(fn) {
  return fn()
    .then((res) => res)
    .catch(() => repeatPromiseUntilResolve(fn));
}

function amountOfDiscounts(prod) {
  const { type, color } = prod;
  switch (true) {
    case type === 'hat' && color === 'red':
      return 3;
    case type === 'hat':
      return 2;
    default:
      return 1;
  }
}

const discountPromisify = util.promisify(discountCallback);

module.exports = {
  discountCallback,
  discountPromise,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
  discountPromisify,
};
