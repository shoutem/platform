'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getBuckPath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'android/app/BUCK')
  );
}

module.exports = getBuckPath;
