const { parse: parseQuery } = require('querystring');
const { URL } = require('url');
const { routerHandler, streamHandler } = require('./router');

module.exports = (req, res) => {
  try {
    if (req.headers['content-type'] === 'application/csv+gzip') {
      streamHandler(res, req);
      return;
    }

    const { url } = req;
    const parsedUrl = new URL(url, process.env.ORIGIN);
    const queryParams = parseQuery(parsedUrl.search.slice(1));
    const path = parsedUrl.pathname;

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
        if (req.headers['content-type'] === 'application/json') body = JSON.parse(body);
        else body = {};
        routerHandler(
          {
            ...req,
            body,
            queryParams,
            path,
          },
          res,
        );
      });
  } catch (error) {
    console.log(error);
  }
};
