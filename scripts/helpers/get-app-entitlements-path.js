'use strict';

const path = require('path');
const findFileOnPath = require('./find-file-on-path.js');
const getXcodeProjectName = require('./get-xcode-project-name.js');
const projectPath = require('./get-project-path');

const xcodeProjectName = getXcodeProjectName({ cwd: `${projectPath}/ios` });
const entitlementsFileName = `${xcodeProjectName}.entitlements`;

function getAppEntitlementsPath(options = { cwd: '.' }) {
  return findFileOnPath(entitlementsFileName, path.resolve(options.cwd, 'ios'));
}

module.exports = getAppEntitlementsPath;
