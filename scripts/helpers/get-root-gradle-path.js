'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getRoodGradlePath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/build.gradle')
  );
}

module.exports = getRoodGradlePath;
