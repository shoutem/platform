'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getGradleConstantsPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/constants.gradle')
  );
}

module.exports = getGradleConstantsPath;
