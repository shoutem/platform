'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getAndroidManifestPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/app/src/main/AndroidManifest.xml')
  );
}

module.exports = getAndroidManifestPath;
