const { execSync } = require('child_process');

const { filesChangedByConfigurationScript } = require('./const');
const projectPath = require('./get-project-path');

module.exports = function sanitizeDiff() {
  filesChangedByConfigurationScript.forEach(file => {
    execSync(`git update-index --assume-unchanged ${file}`, {
      cwd: projectPath,
    });
  });
};
