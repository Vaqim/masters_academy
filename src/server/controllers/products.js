const fs = require('fs');
const { createGunzip } = require('zlib');
const { nanoid } = require('nanoid');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { createCsvToJson, buildUniqJson, getFilesInfo } = require('../../services');

const promisifiedPipeline = promisify(pipeline);

async function updateCsv(inputStream) {
  const gunzip = createGunzip();
  const filename = `${nanoid(10)}.json`;
  const filePath = path.join(process.env.UPLOADS, filename);
  const outputStream = fs.createWriteStream(filePath);
  const csvToJson = createCsvToJson();

  try {
    await promisifiedPipeline(inputStream, gunzip, csvToJson, outputStream);
  } catch (error) {
    console.log('csv pipeline failed: ', error);
  }
}

async function jsonOptimization(data, res) {
  const filePath = path.join(process.env.UPLOADS, data.filename);

  if (!fs.existsSync(filePath)) {
    res.status(422).send('incorrect filename');
    return;
  }

  const readStream = fs.createReadStream(filePath);
  const buildUniqJsonStream = buildUniqJson();
  const writeStream = fs.createWriteStream(path.join(process.env.OPTIMIZED, data.filename));

  try {
    res.status(202).send('accepted');
    await promisifiedPipeline(readStream, buildUniqJsonStream, writeStream);
  } catch (error) {
    console.log('streams error', error);
  }
}

async function getFiles(res) {
  const pathToUploads = process.env.UPLOADS;
  const pathToOptomized = process.env.OPTIMIZED;

  try {
    const filesList = await getFilesInfo(pathToUploads);
    const optFilesList = await getFilesInfo(pathToOptomized);

    res.json(JSON.stringify({ uploads: filesList, optimized: optFilesList }));
  } catch (error) {
    console.error(error);
    res.status(500).send('We have a problem :(');
  }
}

module.exports = { updateCsv, jsonOptimization, getFiles };
