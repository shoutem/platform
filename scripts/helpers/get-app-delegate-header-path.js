'use strict';

const findFileOnPath = require('./find-file-on-path.js');

function getAppDelegateHeaderPath() {
  return findFileOnPath('AppDelegate.h', 'ios');
}

module.exports = getAppDelegateHeaderPath;
