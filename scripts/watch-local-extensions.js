'use-strict';

const path = require('path');
const fs = require('fs-extra');
const watch = require('node-watch');
const globToRegExp = require('glob-to-regexp');
const parseGitignore = require('parse-gitignore');
const _ = require('lodash');

const getLocalExtensions = require('./helpers/get-local-extensions.js');
const configJsonPath = path.resolve('config.json');

const COPY_DELAY_MS = 200;

function getIgnoreListForPath(folder) {
  const gitignorePatterns = parseGitignore(path.join(folder, '.gitignore'));
  const npmignorePatterns = parseGitignore(path.join(folder, '.npmignore'));
  return _.union(gitignorePatterns, npmignorePatterns, '.git');
}

function copyFile(src, dest) {
  console.log(`Copying \nsrc: ${src} \ndst: ${dest}`);
  fs.copy(src, dest, (error) => {
    if (error) {
      return console.error(error);
    }
  });
}

function copyFileDelayed(src, dest) {
  _.debounce(() => copyFile(src, dest), COPY_DELAY_MS)();
}

function watchWorkingDirectories() {
  const config = fs.readJsonSync(configJsonPath);
  const localExtensions = getLocalExtensions(config.workingDirectories);
  localExtensions.forEach((extension) => {
    const packageName = extension.id;
    const packagePath = extension.path;
    const nodeModules = 'node_modules';
    const ignoreList = getIgnoreListForPath(packagePath);
    const installedExtensionPath = path.join(nodeModules, packageName);
    const shouldCopyFile = (filePath) =>
      !_.some(ignoreList, (ignorePath) =>
         globToRegExp(path.join(packagePath, ignorePath)).test(filePath)
      );

    console.log(`Watching: ${packageName}`);
    watch(packagePath, (filename) => {
      const localPath = path.relative(packagePath, filename);
      const destination = path.join(installedExtensionPath, localPath);

      if (shouldCopyFile(filename)) {
        copyFileDelayed(filename, destination);
      }
    });
  });
}

// Initial watch for working directories
watchWorkingDirectories();

// Watch changes on config.json and trigger build and re-watch for working directories
watch(configJsonPath, () => {
  console.error('config.json changed. You should rebuild the app!');
});
