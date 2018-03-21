'use strict';

const findFileOnPath = require('./find-file-on-path.js');

function getInfoPath() {
  return findFileOnPath('Info.plist', 'ios');
}

module.exports = getInfoPath;
