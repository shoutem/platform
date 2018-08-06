'use strict';

const path = require('path');
const findFileOnPath = require('./find-file-on-path.js');

function getAppDelegateHeaderPath(options = { cwd: '.' }) {
  return findFileOnPath('AppDelegate.h', path.resolve(options.cwd, 'ios'));
}

module.exports = getAppDelegateHeaderPath;
