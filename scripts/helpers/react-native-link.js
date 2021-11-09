'use strict';

const { execSync } = require('child_process');
const projectPath = require('./get-project-path');

const defaults = {
  stdio: ['ignore', 'inherit', 'inherit'],
  cwd: projectPath,
};

module.exports = function reactNativeLink(libraryName, opts = {}) {
  const { configFilePath } = opts;
  const configArgs = configFilePath ? ` --config ${configFilePath}` : '';
  const options = Object.assign(defaults, opts);

  return execSync(`react-native link ${libraryName}${configArgs}`, options);
};
