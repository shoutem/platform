'use strict';

const findFileOnPath = require('./find-file-on-path.js');
const projectPath = require('./get-project-path');

function getInfoPath() {
  return findFileOnPath('Info.plist', `${projectPath}/ios`);
}

module.exports = getInfoPath;
