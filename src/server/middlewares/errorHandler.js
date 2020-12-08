function errorHandler(err, req, res, next) {
  switch (err.name) {
    case 'AuthorizationError':
      res.status(403).send(err.message);
      break;
    default:
      console.log(err);
      res.status(500).send(err.message);
      break;
  }
}

module.exports = errorHandler;
