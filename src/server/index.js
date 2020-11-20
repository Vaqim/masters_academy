const http = require('http');
const requestHandler = require('./requestHandler');

const server = http.createServer(requestHandler);

function start() {
  server.listen(Number(process.env.PORT), () => {
    console.log(`Listening in port ${process.env.PORT}`);
  });
}

function stop(callback) {
  server.close((err) => {
    if (err) {
      console.error(err, 'Failed to close server!');
      callback();
      return;
    }

    console.log('Server has been stopped.');
    callback();
  });
}

module.exports = {
  start,
  stop,
};
