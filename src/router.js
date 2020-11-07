const { getFilter, getMaxCost, getFormatter, notFound } = require('./controller');

module.exports = (req, res) => {
  const { url, method, queryParams, body: data } = req;

  console.log(data);
  console.log(queryParams);
  console.log(url);

  if (method === 'GET') {
    switch (url) {
      case '/':
        console.log('Home');
        res.end();
        break;
      case '/filter':
        getFilter(res, queryParams);
        break;
      case '/maxcost':
        getMaxCost(res);
        break;
      case '/format':
        getFormatter(res);
        break;
      default:
        notFound(res);
    }
  }

  if (method === 'POST') {
    switch (url) {
      case '/filter':
        console.log('filter function');
        break;
      case '/maxCost':
        console.log('maxCost function');
        break;
      case '/formatter':
        console.log('formatter function');
        break;
      default:
        notFound(res);
    }
  }
};
