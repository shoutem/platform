'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getWebBuildConfig(options = { cwd: '.' }) {

  return systemSlash(
    path.resolve(options.cwd, `web/buildConfig.json`),
  );
}

module.exports = getWebBuildConfig;
