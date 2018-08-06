'use strict';

const fs = require('fs-extra');
const path = require('path');
const spawn = require('child-process-promise').spawn;
const _ = require('lodash');
const glob = require('glob');
const promisify = require('pify');
const linkLocal = promisify(require('linklocal'));

const packageJsonFileName = 'package.template.json';
const packageJsonTemplate = fs.readJsonSync(path.resolve(packageJsonFileName));

function addDependencyToPackageJson(packageJson, name, version) {
  // eslint-disable-next-line no-param-reassign
  packageJson.dependencies[name] = version;
}

function installJsDependencies() {
  console.log('Installing dependencies:'.bold);

  return spawn('yarn', ['install'], {
    stderr: 'inherit',
    stdio: 'inherit',
  });
}

function installNpmExtension(extension) {
  // This could actually be any valid npm install argument (version range,
  // GitHub repo, URL to a .tgz file, or even local path) but for now,
  // it's always the URL to the .tgz stored on our server
  const extensionPackageURL = _.get(extension, 'attributes.location.app.package');
  const packageName = extension.id;

  addDependencyToPackageJson(packageJsonTemplate, packageName, extensionPackageURL);
}

function writeJson(content, filePath) {
  const json = JSON.stringify(content, null, 2);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, json, (err) => {
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

function getPodspecPaths(extensions) {
  return _.reduce(extensions, (paths, extension) => {
    const podspecPath = glob.sync(`node_modules/${extension.id}/*.podspec`);
    return paths.concat(podspecPath);
  }, []);
}

function getPodspecStrings(podspecPaths) {
  return _.map(podspecPaths, (podspecPath) => {
    const podName = path.basename(podspecPath, '.podspec');
    return `pod '${podName}', :path => '../${podspecPath}'`;
  }).join('\n');
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

    this.extensionsToInstall.forEach((extension) =>
      installNpmExtension(extension)
    );

    this.localExtensions.forEach((extension) =>
      addDependencyToPackageJson(packageJsonTemplate, extension.id, `file:${extension.path}`)
    );

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
        '[ERROR]: You are trying to build an app without any extensions'.bold.red
      );
    }

    const extensionsMapping = [];
    const extensions = _.uniqBy(installedExtensions, 'id');

    extensions.forEach((extension) => {
      if (extension) {
        extensionsMapping.push(
          `'${extension.id}': require('${extension.id}'),\n  `
        );
      }
    });

    const extensionsString = extensionsMapping.join('');
    const data = `export default {\n  ${extensionsString}};\n`;

    console.time('Create extensions.js'.bold.green);

    return new Promise((resolve, reject) => {
      fs.writeFile(this.extensionsJsPath, data, (error) => {
        if (error) {
          return reject(error);
        }

        console.timeEnd('Create extensions.js'.bold.green);
        return resolve();
      });
    });
  }

  installCocoaPods(installedExtensions) {
    const podTemplatePath = 'ios/Podfile.template';
    let podFileTemplate = '';

    try {
      podFileTemplate = fs.readFileSync(podTemplatePath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`No ${podTemplatePath} found, skipping 'pod install'...`);
        return Promise.resolve();
      }

      console.log(`Error reading ${podTemplatePath}!`);
      throw new Error(err);
    }

    const podPath = 'ios/Podfile';
    const extensionsPlaceholderRegExp = /## <Extension dependencies>/g;
    const podspecPaths = getPodspecPaths(installedExtensions);
    const pods = getPodspecStrings(podspecPaths);
    const podFileContent = podFileTemplate.replace(extensionsPlaceholderRegExp, pods);

    fs.writeFileSync(podPath, podFileContent);

    return spawn('pod', ['install'], {
      stdio: 'inherit',
      cwd: 'ios',
      env: _.merge(process.env, { FORCE_COLOR: true }),
    });
  }

  installNativeDependencies(installedExtensions) {
    // If the process is running on OSX, then run 'pod install'
    // to configure iOS native dependencies
    if (process.platform === 'darwin') {
      return Promise.resolve()
        .then(() => console.log('pod install - [Running...]'))
        .then(() => this.installCocoaPods(installedExtensions))
        .then(() => console.log('pod install - [OK]'));
    }

    return Promise.resolve();
  }
}

module.exports = ExtensionsInstaller;
