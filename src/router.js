const {
  getFilter,
  getMaxCost,
  getFormatter,
  notFound,
  postSwitchSource,
  getShowData,
  postEdit,
} = require('./controller');

module.exports = (req, res) => {
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
      default:
        notFound(res);
    }
  } else if (method === 'POST') {
    switch (path) {
      case '/edit':
        postEdit(res, data);
        break;
      case '/switchsource':
        postSwitchSource(res, data);
        break;
      default:
        notFound(res);
    }
  } else {
    notFound(res);
  }
};
