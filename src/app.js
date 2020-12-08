const fs = require('fs');
const { createServer } = require('http');
const config = require('./config');
const app = require('./server');

const server = createServer(app);

function start() {
  server.listen(+config.port, () => {
    console.log(`Listening in port ${config.port}`);
  });
}

function stop(callback) {
  server.close((err) => {
    if (err) {
      console.error(err, 'Failed to close server!');
      callback(err);
      return;
    }

    console.log('Server has been stopped.');
    callback();
  });
}

function enableGracefulExit() {
  const exitHandler = (error) => {
    if (error) console.error(error);

    console.log('Graceful stopping...');
    stop(() => {
      process.exit();
    });
  };
  // ctrl + c
  process.on('SIGINT', exitHandler);
  process.on('SIGTERM', exitHandler);
  // kill pid (nodemon restart)
  process.on('SIGUSR1', exitHandler);
  process.on('SIGUSR2', exitHandler);

  process.on('uncaugthException', exitHandler);
  process.on('unhendledRejection', exitHandler);
}

function boot() {
  if (!fs.existsSync(process.env.UPLOADS)) fs.mkdirSync(process.env.UPLOADS);
  if (!fs.existsSync(process.env.OPTIMIZED)) fs.mkdirSync(process.env.OPTIMIZED);
  enableGracefulExit();
  start();
}

boot();
