'use strict';

const { execSync } = require('child_process');
const projectPath = require('./get-project-path');
const { prependProjectPath } = require('./path');

const rnCliPath = prependProjectPath('node_modules/react-native/local-cli/cli.js');

const defaults = {
  stdio: ['ignore', 'inherit', 'inherit'],
  cwd: projectPath,
};

module.exports = function reactNativeLink(libraryName, opts = {}) {
  const { configFilePath } = opts;
  const configArgs = configFilePath ? ` --config ${configFilePath}` : '';
  const options = Object.assign(defaults, opts);

  return execSync(`node ${rnCliPath} link ${libraryName}${configArgs}`, options);
};
