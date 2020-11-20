require('dotenv').config();
const server = require('./server');

function enableGracefulExit() {
  const exitHandler = (error) => {
    if (error) console.error(error);

    console.log('Graceful stopping...');
    server.stop(() => {
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
  enableGracefulExit();
  server.start();
}

boot();
