'use strict';

const findFileOnPath = require('./find-file-on-path.js');

const getXcodeProjectPath = () => findFileOnPath('project.pbxproj', 'ios');

module.exports = getXcodeProjectPath;
