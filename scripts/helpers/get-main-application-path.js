'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getMainApplicationPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(
      options.cwd,
      'android/app/src/main/java/com/shoutemapp/MainApplication.java',
    ),
  );
}

module.exports = getMainApplicationPath;
