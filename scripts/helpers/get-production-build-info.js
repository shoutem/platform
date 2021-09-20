const request = require('request-promise');
const _ = require('lodash');

function getBuildUrl(buildConfig) {
  const { serverApiEndpoint, appId } = buildConfig;

  const path = 'configurations/current/builds';

  return `http://prod.${serverApiEndpoint}/v1/apps/${appId}/${path}`;
}

async function getProductionBuildInfo(buildConfig, platform) {
  const configurationUrl = getBuildUrl(buildConfig);

  const requestOptions = {
    url: configurationUrl,
    headers: {
      Accept: 'application/vnd.api+json',
      Authorization: `Bearer ${buildConfig.authorization}`,
    },
  };

  try {
    const body = await request.get(requestOptions);
    const parsedBody = JSON.parse(body);
    const productionBuild = _.find(parsedBody.data, build => {
      if (
        build.attributes.devicePlatform === platform &&
        build.attributes.buildType === 'production'
      ) {
        return build;
      }
    });

    return productionBuild;
  } catch (error) {
    console.error('Could not get production build info.', error);
  }

  return false;
}

module.exports = getProductionBuildInfo;
