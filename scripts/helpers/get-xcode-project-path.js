'use strict';

const findFileOnPath = require('./find-file-on-path.js');

function getXcodeProjectPath(options = { cwd: 'ios' }) {
  return findFileOnPath('project.pbxproj', options.cwd);
}

module.exports = getXcodeProjectPath;
