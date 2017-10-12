'use strict';

const findFileOnPath = require('./find-file-on-path.js');

const getAppDelegatePath = () => findFileOnPath('AppDelegate.m', 'ios');

module.exports = getAppDelegatePath;
