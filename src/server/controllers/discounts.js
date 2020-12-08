const productsArray = require('../../../input_array.json');
const {
  discountCallback,
  discountPromise,
  discountPromisify,
  amountOfDiscounts,
  repeatPromiseUntilResolve,
} = require('../../services');

function getDiscountCallback(res) {
  const data = productsArray;
  const newData = [];
  let amount;

  function callback(err, value, product) {
    if (err) {
      return discountCallback(callback, product);
    }
    if (Array.isArray(product.discount)) product.discount.push(value);
    else product.discount = [value];

    amount = amountOfDiscounts(product);

    if (Array.isArray(product.discount) && product.discount.length < amount) {
      discountCallback(callback, product);
    } else {
      product.discount = +product.discount
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red);
      product.discount = `${((1 - product.discount) * 100).toFixed()}%`;
      newData.push(product);
      if (newData.length === data.length) res.json(JSON.stringify(newData));
      else return;
    }
  }

  data.forEach((product) => {
    discountCallback(callback, product);
  });
}

function getDiscountPromise(res) {
  const data = productsArray.myMap((product) => {
    const amount = amountOfDiscounts(product);
    const discounts = [];
    for (let i = 0; i < amount; i++) discounts.push(repeatPromiseUntilResolve(discountPromise));
    return Promise.all(discounts).then((discountSet) => {
      product.discount = +discountSet
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red);
      product.discount = `${((1 - product.discount) * 100).toFixed()}%`;
      return product;
    });
  });

  Promise.all(data).then((result) => {
    res.json(JSON.stringify(result));
  });
}

async function getDiscountAsync(res) {
  try {
    let data = productsArray.myMap(async (product) => {
      const amount = amountOfDiscounts(product);
      let discounts = [];
      for (let i = 0; i < amount; i++) discounts.push(repeatPromiseUntilResolve(discountPromisify));
      discounts = await Promise.all(discounts);
      discounts = +discounts
        .map((discount) => (100 - discount) / 100)
        .reduce((acc, red) => acc * red);
      product.discount = discounts;
      product.discount = `${((1 - product.discount) * 100).toFixed()}%`;
      return product;
    });

    data = await Promise.all(data);
    res.json(JSON.stringify(data));
  } catch (e) {
    console.log(e.message);
    res.status(500).send('Houston, we have a problem');
  }
}

module.exports = { getDiscountCallback, getDiscountPromise, getDiscountAsync };
