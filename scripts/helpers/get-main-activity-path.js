'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getMainActivityPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/app/src/main/java/com/shoutemapp/MainActivity.java')
  );
}

module.exports = getMainActivityPath;
