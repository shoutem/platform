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

const DOWNLOAD_ATTEMPTS = 3;
const DOWNLOAD_RETRY_DELAY = 1000;

/**
 * Downloads a single file to disk. Rejects on transport errors (the `request`
 * object is where connection-level failures such as ECONNRESET surface) as well
 * as on write errors, and treats any non-2xx response as a failure instead of
 * silently writing an error page to disk.
 *
 * @param url The file URL to download.
 * @param path Destination path on disk. Removed if the download fails.
 * @returns {Promise<void>} Resolves once the file is fully written.
 */
function downloadFileOnce(url, path) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const fail = err => {
      if (settled) {
        return;
      }

      settled = true;
      fs.remove(path, () => reject(err));
    };

    const req = request(url);

    // Connection-level failures (ECONNRESET, socket hang up, DNS) are emitted
    // on the request, not on the write stream it is piped into. Without this
    // listener node treats them as an unhandled 'error' event and aborts the
    // whole process.
    req.on('error', fail);

    req.on('response', response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        req.abort();
        fail(
          new Error(
            `Download of ${url} failed with status ${response.statusCode}.`,
          ),
        );
      }
    });

    req
      .pipe(fs.createWriteStream(path))
      .on('error', fail)
      .on('close', () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      });
  });
}

/**
 * Downloads a file, retrying a few times when the failure looks transient.
 * Configure issues many concurrent downloads, and remote hosts intermittently
 * reset those connections - a retry is far cheaper than failing the whole build.
 *
 * @param url The file URL to download.
 * @param path Destination path on disk.
 * @param attemptsLeft Remaining attempts, including the current one.
 * @returns {Promise<void>} Resolves once the file is fully written.
 */
function downloadFile(url, path, attemptsLeft = DOWNLOAD_ATTEMPTS) {
  return downloadFileOnce(url, path).catch(err => {
    if (attemptsLeft <= 1) {
      throw err;
    }

    // eslint-disable-next-line no-console
    console.warn(
      `[platform] files.downloadFile: download of ${url} failed, retrying.`,
      err,
    );

    return new Promise(resolve =>
      setTimeout(resolve, DOWNLOAD_RETRY_DELAY),
    ).then(() => downloadFile(url, path, attemptsLeft - 1));
  });
}

exports.writeFile = writeFile;
exports.writeJsonToFile = writeJsonToFile;
exports.downloadFile = downloadFile;
