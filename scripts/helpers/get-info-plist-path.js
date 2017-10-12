'use strict';

const findFileOnPath = require('./find-file-on-path.js');

const getInfoPath = () => findFileOnPath('Info.plist', 'ios');

module.exports = getInfoPath;
