function notFound(res) {
  res.statusCode = 404;
  res.write('404 Not Found');
  res.end();
}

module.exports = (req, res) => {
  const { url, method, queryParams, body: data } = req;

  console.log(data);
  console.log(queryParams);

  if (method === 'GET') {
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
        console.log('default 404');
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
        console.log('default 404');
    }
  }
  res.end();
};
