'use-strict';

const path = require('path');
const fs = require('fs-extra');
const parseGitignore = require('parse-gitignore');
const _ = require('lodash');
const readline = require('readline');
const chokidar = require('chokidar');

const getLocalExtensions = require('./helpers/get-local-extensions.js');
const configJsonPath = path.resolve('config.json');

const NODE_MODULES = 'node_modules';

function getIgnoreListForExtension(extensionPath) {
  const gitignorePatterns = parseGitignore(path.join(extensionPath, '.gitignore'));
  const npmignorePatterns = parseGitignore(path.join(extensionPath, '.npmignore'));

  return _.union(gitignorePatterns, npmignorePatterns, '.git');
}

function watchWorkingDirectories() {
  const config = fs.readJsonSync(configJsonPath);
  const localExtensions = getLocalExtensions(config.workingDirectories);

  localExtensions.forEach(extension => {
    const extensionName = extension.id;
    const extensionPath = extension.path;

    const watcher = chokidar.watch(extensionPath, {
      ignored: getIgnoreListForExtension(extensionPath),
      persistent: true,
    });

    watcher
      .on('ready', () => {
        console.log(`Watching: ${extensionName}`);
      })
      .on('add', addPath => {
        const srcRelativePath = path.relative(extensionPath, addPath);
        const dstPath = path.join(NODE_MODULES, extensionName, srcRelativePath);

        fs.copy(addPath, dstPath)
          .then(() => console.log(`ADD:${dstPath}`))
          .catch(err => console.error(err))
      })
      .on('unlink', removePath => {
        const srcRelativePath = path.relative(extensionPath, removePath);
        const dstPath = path.join(NODE_MODULES, extensionName, srcRelativePath);

        fs.remove(dstPath)
          .then(() => console.log(`DEL:${dstPath}`))
          .catch(err => console.error(err))
      })
      .on('change', changedPath => {
        const srcRelativePath = path.relative(extensionPath, changedPath);
        const dstPath = path.join(NODE_MODULES, extensionName, srcRelativePath);

        fs.copy(changedPath, dstPath)
          .then(() => console.log(`CP: \n${changedPath} to \n${dstPath}`))
          .catch(err => console.error(err))
      })
      .on('error', error => log(`Watcher error: ${error}`));
  });
}

function supportGracefulShutdownOnWindows() {
  if (/^win/.test(process.platform)) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on('SIGINT', function () {
      process.emit('SIGINT');
    });
  }

  process.on('SIGINT', function () {
    process.exit();
  });
}

// Initial watch for working directories
watchWorkingDirectories();
// adds SIGINT (CTRL+C) fix on windows
supportGracefulShutdownOnWindows();

// Watch changes on config.json and trigger build and re-watch for working directories
chokidar.watch(configJsonPath, () => {
  console.error('config.json changed. You should rebuild the app!');
});
