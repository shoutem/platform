'use strict';

const path = require('path');
const { systemSlash } = require('./path');

function getPackageJsonPath(options = { cwd: '.' }) {
  return systemSlash(path.resolve(options.cwd, 'package.json'));
}

module.exports = getPackageJsonPath;
