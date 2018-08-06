const fs = require('fs-extra');
const request = require('request');

function writeFile(filePath, data) {
  fs.ensureFileSync(filePath);
  fs.writeFileSync(filePath, data, {}, err => {
    console.log(`Unable to save the ${filePath}: ${err}`);
  });
}

function writeJsonToFile(filePath, json) {
  fs.ensureFileSync(filePath);
  fs.writeJsonSync(filePath, json, { spaces: 2 }, err => {
    console.log(`Unable to save the ${filePath}: ${err}`);
  });
}

function downloadFile(url, path) {
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', () => {
        resolve();
      })
      .on('error', err => {
        fs.unlink(path);
        reject(err);
      });
  });
}

exports.writeFile = writeFile;
exports.writeJsonToFile = writeJsonToFile;
exports.downloadFile = downloadFile;
