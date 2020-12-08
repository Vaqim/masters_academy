function errorHandler(err, req, res, next) {
  console.log(err);
  switch (err.name) {
    case 'AuthorizationError':
      res.status(403).send(err.message);
      break;
    default:
      res.status(500).send(err.message);
      break;
  }
}

module.exports = errorHandler;
