'use strict';

const Promise = require('bluebird');
const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');
const { spawn } = require('child-process-promise');
const _ = require('lodash');
const promisify = require('pify');
const linkLocal = promisify(require('linklocal'));

const packageJsonTemplateFileName = 'package.template.json';
const packageJsonTemplatePath = path.resolve(packageJsonTemplateFileName);
const packageJsonTemplate = fs.readJsonSync(packageJsonTemplatePath);

function addDependencyToPackageJson(packageJson, name, version) {
  // eslint-disable-next-line no-param-reassign
  packageJson.dependencies[name] = version;
}

async function installJsDependencies() {
  console.log('Installing dependencies:'.bold);
  console.time('Installing dependencies took');
  const stdArgs = { stderr: 'inherit', stdio: 'inherit' };

  const bunCheckCommand = 'bun -v';
  const bunExists = shell.exec(bunCheckCommand).code === 0;
  if (bunExists) {
    await spawn('bun', ['install'], stdArgs);
    // running postinstall manually
    await spawn('bun', ['run', 'postinstall'], stdArgs);
    console.timeEnd('Installing dependencies took');
    return;
  }

  const yarnCheckCommand = 'yarn -v';
  const yarnExists = shell.exec(yarnCheckCommand).code === 0;
  if (yarnExists) {
    await spawn('yarn', ['install'], stdArgs);
    console.timeEnd('Installing dependencies took');
    return;
  }

  await spawn('npm', ['install'], stdArgs);
  console.timeEnd('Installing dependencies took');
}

function installNpmExtension(extension) {
  // This could actually be any valid npm install argument (version range,
  // GitHub repo, URL to a .tgz file, or even local path) but for now,
  // it's always the URL to the .tgz stored on our server
  const extensionPackageURL = _.get(
    extension,
    'attributes.location.app.package',
  );
  const packageName = extension.id;

  addDependencyToPackageJson(
    packageJsonTemplate,
    packageName,
    extensionPackageURL,
  );
}

function writeJson(content, filePath) {
  const json = JSON.stringify(content, null, 2);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, json, err => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function writePackageJson(content) {
  return writeJson(content, 'package.json');
}

/**
 * ExtensionInstaller links all local extensions and installs all other extensions from app
 * configuration. It also builds extension.js file which app uses as depedencies dictionary.
 * @param  Array localExtensions The list of extensions in your local extensions folder
 * @param  Array extensions The list of extensions installed in app
 * @param  String extensionsJsPath path to extension.js file
 */
class ExtensionsInstaller {
  constructor(localExtensions = [], extensions = [], extensionsJsPath = '') {
    this.localExtensions = localExtensions;
    this.extensionsJsPath = extensionsJsPath;
    this.extensionsToInstall = extensions;
  }

  installExtensions() {
    const workingDir = process.cwd();

    this.extensionsToInstall.forEach(extension => installNpmExtension(extension),);

    this.localExtensions.forEach(extension =>
      addDependencyToPackageJson(
      packageJsonTemplate,
      extension.id,
      `file:${extension.path}`,
    ));

    const installedExtensions = [
      ...this.localExtensions,
      ...this.extensionsToInstall,
    ];

    return writePackageJson(packageJsonTemplate)
      .then(() => installJsDependencies())
      .then(() => linkLocal(workingDir))
      .then(() => Promise.resolve(installedExtensions));
  }

  createExtensionsJs(installedExtensions) {
    console.log('Creating extensions.js');

    if (_.isEmpty(installedExtensions)) {
      return Promise.reject(
        '[ERROR]: You are trying to build an app without any extensions'.bold
          .red,
      );
    }

    console.time('Create extensions.js'.bold.green);
    const customExtensions = [];
    const shoutemExtensions = [];
    const extensions = _.uniqBy(installedExtensions, 'id');

    extensions.forEach(extension => {
      if (extension) {
        if (extension.id.startsWith('shoutem.')) {
          shoutemExtensions.push(
            `'${extension.id}': require('${extension.id}'),\n  `,
          );
        } else {
          customExtensions.push(
            `'${extension.id}': require('${extension.id}'),\n  `,
          );
        }
      }
    });

    const extensionsMapping = shoutemExtensions.concat(customExtensions);
    const extensionsString = extensionsMapping.join('');
    const data = `export default {\n  ${extensionsString}};\n`;

    return new Promise((resolve, reject) => {
      fs.writeFile(this.extensionsJsPath, data, error => {
        if (error) {
          return reject(error);
        }

        console.timeEnd('Create extensions.js'.bold.green);
        return resolve();
      });
    });
  }

  async installCocoaPods() {
    console.time('Cocoapods installation took');

    await spawn('pod', ['install'], {
      stdio: 'inherit',
      cwd: 'ios',
      env: _.merge(process.env, { FORCE_COLOR: true }),
    });

    console.timeEnd('Cocoapods installation took');
  }

  async jetify() {
    console.time('Jetified in');

    await spawn('node', ['node_modules/jetifier/bin/jetify'], {
      stdio: 'inherit',
      env: _.merge(process.env, { FORCE_COLOR: true }),
    });

    console.timeEnd('Jetified in');
  }

  async installNativeDependencies() {
    await this.jetify();

    // If the process is running on OSX, then run 'pod install' to configure
    // iOS native dependencies
    if (process.platform === 'darwin') {
      await this.installCocoaPods();
    }
  }
}

module.exports = ExtensionsInstaller;
