'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getResStringsPath(options = { cwd: '.' }) {
  return systemSlash(path.resolve(options.cwd, 'android/app/src/main/res/values/strings.xml'));
}

module.exports = getResStringsPath;
