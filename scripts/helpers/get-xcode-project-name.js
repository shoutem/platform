'use strict';

const path = require('path');
const getXcodeProjectPath = require('./get-xcode-project-path');

function getXcodeProjectName(options) {
  const xCodeProjectPath = getXcodeProjectPath(options);
  // resolve parent directory for project file
  const xCodeProjectDir = path.dirname(xCodeProjectPath);
  // take the name of that directory (without .xcodeproj suffix)
  return path.basename(xCodeProjectDir, '.xcodeproj');
}

module.exports = getXcodeProjectName;
