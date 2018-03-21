'use strict';

const findFileOnPath = require('./find-file-on-path.js');

function getAppDelegatePath() {
  return findFileOnPath('AppDelegate.m', 'ios');
}

module.exports = getAppDelegatePath;
