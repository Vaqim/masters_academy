require('dotenv').config();
const http = require('http');
const requestHandler = require('./requestHandler');

const server = http.createServer(requestHandler);
server.listen(process.env.PORT, () => {
  console.log(`Listening in port ${process.env.PORT}`);
});
