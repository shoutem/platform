'use strict';

const path = require('path');
const findFileOnPath = require('./find-file-on-path.js');

function getAppDelegatePath(options = { cwd: '.' }) {
  return findFileOnPath('AppDelegate.m', path.resolve(options.cwd, 'ios'));
}

module.exports = getAppDelegatePath;
