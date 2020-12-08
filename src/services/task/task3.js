function thirdTask(inputArray) {
  return inputArray.map((e) => {
    if (!e.quantity) e.quantity = 0;
    if (e.priceForPair) {
      e.price = e.priceForPair;
      delete e.priceForPair;
    }
    return e;
  });
}

module.exports = thirdTask;
