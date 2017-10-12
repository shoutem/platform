'use strict';

const getXcodeProjectPath = require('./get-xcode-project-path');
const xcodeProjectPath = getXcodeProjectPath();

const getXcodeProjectName = () => xcodeProjectPath.split('.xcodeproj')[0].split('/')[1];

module.exports = getXcodeProjectName;
