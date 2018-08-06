'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getGradlePropertiesPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/gradle.properties')
  );
}

module.exports = getGradlePropertiesPath;
