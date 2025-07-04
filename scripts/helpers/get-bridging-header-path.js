'use strict';

const path = require('path');
const findFileOnPath = require('./find-file-on-path');

function getBridgingHeaderPath(options = { cwd: '.' }) {
  return findFileOnPath('Bridging-Header.h', path.resolve(options.cwd, 'ios'));
}

module.exports = getBridgingHeaderPath;
