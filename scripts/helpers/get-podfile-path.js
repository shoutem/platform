'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getPodfilePath(options = { cwd: '.' }) {
  return systemSlash(path.resolve(options.cwd, 'ios/Podfile'));
}

module.exports = getPodfilePath;
