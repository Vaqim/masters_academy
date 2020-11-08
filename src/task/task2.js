function secondTask(inputArray) {
  let maxCost = 0;
  let mostExpansive;
  inputArray.forEach((e) => {
    const goodCost = +(e.price || e.priceForPair).slice(1) * (e.quantity || 0);
    if (goodCost > maxCost) {
      maxCost = goodCost;
      mostExpansive = e;
    }
  });
  return mostExpansive;
}

module.exports = secondTask;
