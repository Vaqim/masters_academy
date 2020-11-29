const {
  getFilter,
  getMaxCost,
  getFormatter,
  notFound,
  postSwitchSource,
  getShowData,
  postEdit,
  getDiscountCallback,
  getDiscountPromise,
  getDiscountAsync,
  updateCsv,
  postJsonOptimization,
  getFiles,
} = require('./controller');

function routerHandler(req, res) {
  const { path, method, queryParams, body: data } = req;

  if (method === 'GET') {
    switch (path) {
      case '/':
        getShowData(res);
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
      case '/getsalecallback':
        getDiscountCallback(res);
        break;
      case '/getsalepromise':
        getDiscountPromise(res);
        break;
      case '/getsaleasync':
        getDiscountAsync(res);
        break;
      case '/getfiles':
        getFiles(res);
        break;
      default:
        notFound(res);
    }
  } else if (method === 'POST') {
    switch (path) {
      case '/edit':
        postEdit(res, data);
        break;
      case '/switchsource':
        postSwitchSource(res);
        break;
      case '/optimize':
        postJsonOptimization(data, res);
        break;
      default:
        notFound(res);
    }
  } else {
    notFound(res);
  }
}

async function streamHandler(res, req) {
  const { url, method } = req;

  if (method === 'PUT' && url === '/store/csv') {
    try {
      updateCsv(req);
    } catch (error) {
      console.error(error.message);

      res.setHeader('Content-type', 'application/json');
      res.statusCode = 500;
      res.end('We have an error');
      return;
    }
    res.setHeader('Content-type', 'application/json');
    res.statusCode = 200;
    res.end();
    return;
  }
  notFound(res);
}

module.exports = {
  routerHandler,
  streamHandler,
};
