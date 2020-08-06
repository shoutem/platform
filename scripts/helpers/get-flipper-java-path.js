'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getFlipperJavaPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/app/src/debug/java/com/shoutemapp/ReactNativeFlipper.java')
  );
}

module.exports = getFlipperJavaPath;
