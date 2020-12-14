const { createGunzip } = require('zlib');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { csvToObjectStream } = require('../../services');

const promisifiedPipeline = promisify(pipeline);

async function productsFromFileToDB(inputStream) {
  try {
    const gunzip = createGunzip();
    const csvStr = csvToObjectStream();
    await promisifiedPipeline(inputStream, gunzip, csvStr);
  } catch (error) {
    console.log('pipeline failed: ', error);
  }
}

module.exports = { productsFromFileToDB };
