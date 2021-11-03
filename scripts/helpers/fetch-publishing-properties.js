const request = require('request');
const getErrorMessageFromResponse = require('../helpers/get-error-message-from-response');

async function fetchPublishingProperties(config) {
  const {
    appId,
    authorization,
    legacyApiEndpoint: legacyApiHost = undefined,
  } = config;

  if (!legacyApiHost) {
    process.exitCode = 1;
    throw new Error('legacyApiEndpoint is not set in build config.');
  }

  const legacyApiPath = `/api/applications/publishing_properties.json?nid=${appId}`;

  const requestArgs = {
    url: `http://${legacyApiHost}${legacyApiPath}`,
    headers: {
      Authorization: `Bearer ${authorization}`,
    },
  };

  return new Promise((resolve, reject) => {
    request
      .get(requestArgs, (err, response, body) => {
        if (response.statusCode === 200) {
          const publishingProperties = JSON.parse(body);
          resolve(publishingProperties);
        } else {
          const errorMessage = getErrorMessageFromResponse(response);
          reject(
            `Publishing properties download failed with error: ${response.statusCode} ${errorMessage}`
              .bold.red,
          );
        }
      })
      .on('error', err => {
        reject(err);
      });
  });
}

module.exports = fetchPublishingProperties;
