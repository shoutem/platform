const { execSync } = require('child_process');

const { filesChangedByConfigurationScript } = require('./const');
const projectPath = require('./get-project-path');

// This is used in tandem with the sanitize-diff.js script found in 'helpers'.

module.exports = function resetDiff() {
  filesChangedByConfigurationScript.forEach(file => {
    execSync(`git update-index --no-assume-unchanged ${file}`, {
      cwd: projectPath,
    });
  });
};
