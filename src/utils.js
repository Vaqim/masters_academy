function isEmpty(source) {
  return Object.keys(source).length === 0 || source.length === 0;
}

function generateSale() {
  const sale = Math.floor(Math.random() * Math.floor(99));
  if (sale >= 20) throw new Error('sale is greater then 20');
  return sale;
}

function repeatPromiseUntilResolve(fn) {
  return fn()
    .then((res) => res)
    .catch(() => {
      repeatPromiseUntilResolve(fn);
    });
}

function saleCallback(callback) {
  setTimeout(() => {
    try {
      const sale = generateSale();
      callback(null, sale);
    } catch (error) {
      callback(error);
    }
  }, 50);
}

function salePromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(generateSale());
      } catch (error) {
        reject(error);
      }
    }, 50);
  });
}

Array.prototype.myMap = function (callback) {
  let result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

module.exports = { isEmpty, repeatPromiseUntilResolve, saleCallback, salePromise };
