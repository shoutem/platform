'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getAppGradlePath(options = { cwd: '.' }) {
  return systemSlash(path.resolve(options.cwd, 'android/app/build.gradle'));
}

module.exports = getAppGradlePath;
