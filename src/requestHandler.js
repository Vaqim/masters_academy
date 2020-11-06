const { parse: parseQuery } = require('querystring');
const { URL } = require('url');

module.exports = (req, res) => {
  try {
    const { url, method } = req;
    const parsedUrl = new URL(url, process.env.ORIGIN);
    const queryParams = parseQuery(parsedUrl.search.slice(1));

    let body = [];

    req
      .on('error', (err) => {
        console.log(err);
      })
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
      });
  } catch (error) {
    console.log(error);
  }
};
