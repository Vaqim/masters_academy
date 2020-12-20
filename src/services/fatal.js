module.exports = (message) => {
  console.error('fatal: ', message);
  process.exit(1);
};
