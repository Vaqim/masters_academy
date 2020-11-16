function isEmpty(source) {
  return Object.keys(source).length === 0 || source.length === 0;
}

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
  return new Promise((reject, resolve) => {
    try {
      resolve(generateSale());
    } catch (error) {
      reject(error.message);
    }
  });
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

Array.prototype.myMap = function (callback) {
  let result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

module.exports = {
  isEmpty,
  discountCallback,
  discountPromise,
  amountOfDiscounts,
};
