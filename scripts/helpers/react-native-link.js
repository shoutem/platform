const path = require('path');
const execSync = require('child_process').execSync;
const projectPath = require('./get-project-path');

const rnCliPath = path.resolve(projectPath, 'node_modules/react-native/local-cli/cli.js');

module.exports = function reactNativeLink(libraryName) {
  return execSync(`node ${rnCliPath} link ${libraryName}`);
}
