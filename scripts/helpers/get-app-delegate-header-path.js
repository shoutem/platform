'use strict';

const findFileOnPath = require('./find-file-on-path.js');

const getAppDelegateHeaderPath = () => findFileOnPath('AppDelegate.h', 'ios');

module.exports = getAppDelegateHeaderPath;
