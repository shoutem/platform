'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getWebpackConfigPath(options = { cwd: '.' }) {

  return systemSlash(
    path.resolve(options.cwd, `web/webpack.config.js`),
  );
}

module.exports = getWebpackConfigPath;
