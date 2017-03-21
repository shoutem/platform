'use-strict';

const path = require('path');
const fs = require('fs-extra');
const watch = require('node-watch');
const globToRegExp = require('glob-to-regexp');
const parseGitignore = require('parse-gitignore');
const _ = require('lodash');
const shelljs = require('shelljs');

const getLocalExtensions = require('./helpers/get-local-extensions.js');
// eslint-disable-next-line import/no-unresolved
const configJsonPath = path.resolve('config.json');

// eslint-disable-next-line max-len
const PACKAGER_DEFAULTS_JS_PATH = path.resolve(path.join('node_modules', 'react-native', 'packager', 'defaults.js'));
const defaultsReplacePlaceholder = 'exports.providesModuleNodeModules = [';

function getIgnoreListForPath(folder) {
  const gitignorePatterns = parseGitignore(path.join(folder, '.gitignore'));
  const npmignorePatterns = parseGitignore(path.join(folder, '.npmignore'));
  return _.union(gitignorePatterns, npmignorePatterns);
}

function rewritePackagerDefaultsJs(watchedPackages) {
  const defaultsContent = fs.readFileSync(PACKAGER_DEFAULTS_JS_PATH, 'utf8');
  const nodeModules = `${defaultsReplacePlaceholder}\n  '${watchedPackages.join(`', \n  '`)}',`;
  const rewrittenDefaultsContent = defaultsContent.replace(defaultsReplacePlaceholder, nodeModules);
  fs.writeFileSync(PACKAGER_DEFAULTS_JS_PATH, rewrittenDefaultsContent, 'utf8');
}

function getExtensionIds(extensions) {
  return _.map(extensions, (extension) => extension.id);
}

function watchWorkingDirectories() {
  const config = fs.readJsonSync(configJsonPath);
  const localExtensions = getLocalExtensions(config.workingDirectories);
  rewritePackagerDefaultsJs(getExtensionIds(localExtensions));
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
      const localPath = filename.split(packagePath).pop();
      const destination = path.join(installedExtensionPath, localPath);
      if (shouldCopyFile(filename)) {
        console.log(`Copying ${filename} to ${destination}`);
        fs.copy(filename, destination, (copyError) => {
          if (copyError) {
            console.error(copyError);
          }
        });
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
