/* eslint global-require: "off" */
/* global require needs to be enabled because files to be required are
 * determined dynamically
 */
'use strict';

const spawn = require('child-process-promise').spawn;
const spawnSync = require('child_process').spawnSync;
const execFileSync = require('child_process').execFileSync;
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');
const rimraf = require('rimraf');
const process = require('process');
const request = require('request');
const colors = require('colors');

const AppBinaryConfigurator = require('./app-binary-configurator');
const getLocalExtensions = require('./../helpers/get-local-extensions');
const ExtensionsInstaller = require('./extensions-installer.js');
const buildApiEndpoint = require('./../helpers/build-api-endpoint');
const getExtensionsFromConfiguration = require('./../helpers/get-extensions-from-configuration');
const getErrorMessageFromResponse = require('../helpers/get-error-message-from-response');
const applyReactNativeFixes = require('./../fixes/react-native-fixes');

const npm = require('../services/npm');

const reactNativeCli = path.join('node_modules', 'react-native', 'local-cli', 'cli.js');

function isExtensionLinkable(extension) {
  const pkgPath = `node_modules/${extension.id}/package.json`;
  const packageJson = fs.readJsonSync(pkgPath, { throws: false });

  if (packageJson === null) {
    throw new Error(`${pkgPath} is invalid or empty!`);
  }

  if (packageJson.rnpm) {
    return true;
  }

  const globPattern = `node_modules/${extension.id}/+(android|ios)`;
  const containsAndroidOrIosFolders = glob.sync(globPattern);

  return containsAndroidOrIosFolders.length;
}

/**
 * AppConfigurator configure application for running other steps (app bundling, run or build)
 * It installs extensions and adds native dependencies and static assets to main project
 * @param  {Object} config
 *  {
 *      @key Number appId
 *      @key String serverApiEndpoint
 *      @key boolean debug builds debug build
 *      @key String configurationFilePath path to where app configuration should be saved
 *      @key String extensionsDir local extensions directory
 *      @key String extensionsJsPath path to extension.js
 *  }
 */
class AppConfigurator {
  constructor(buildConfig) {
    this.buildConfig = _.assign({}, buildConfig);
    this.buildExtensions = this.buildExtensions.bind(this);
    this.saveConfigurationFiles = this.saveConfigurationFiles.bind(this);
  }

  getConfigurationUrl() {
    const { serverApiEndpoint, appId, production } = this.buildConfig;
    const apiPath = 'configurations/current';

    return buildApiEndpoint(serverApiEndpoint, appId, apiPath, production);
  }

  downloadConfiguration() {
    console.time('Download configuration'.bold.green);

    const requestParams = {
      url: this.getConfigurationUrl(),
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${this.buildConfig.authorization}`,
      },
    };

    return new Promise((resolve, reject) => {
      request.get(requestParams, (err, response, body) => {
        const statusCode = (response && response.statusCode) || 'No internet connection?';

        if (statusCode === 200) {
          const configuration = JSON.parse(body);
          console.timeEnd('Download configuration'.bold.green);
          this.configuration = configuration;
          resolve(configuration);
        } else {
          const errorMessage = getErrorMessageFromResponse(response);
          reject(`Configuration download failed (${requestParams.url})! Error: ${statusCode} - ${errorMessage}`.bold.red);
        }
      }).on('error', err => {
        reject(err);
      });
    });
  }

  saveConfigurationFiles() {
    const logMessage = 'Save configuration files locally'.bold.green;
    console.time(logMessage);

    fs.ensureDirSync('config');

    return fs.writeJson('config/buildConfig.json', this.buildConfig)
      .then(() => {
        return fs.writeJson('config/appConfig.json', this.configuration);
      })
      .then(() => console.timeEnd(logMessage))
      .catch((err) => {
        throw new Error(err);
      });
  }

  prepareExtensions() {
    const { buildConfig } = this;
    const {
      extensionsJsPath,
      skipNativeDependencies,
      production: isProduction,
      skipLinking,
    } = buildConfig;

    const extensions = getExtensionsFromConfiguration(this.configuration);
    const linkedExtensions = getLocalExtensions(buildConfig.linkedExtensions);

    // npm link all extensions available locally and installed in app configuration
    const localExtensions = _.filter(linkedExtensions, (localExt) =>
      _.find(extensions, { id: localExt.id })
    );

    // install as .tars all extensions that are not available locally
    const extensionsToInstall = extensions
      .filter(ext => !_.some(localExtensions, { id: ext.id }));

    const installer = new ExtensionsInstaller(
      localExtensions,
      extensionsToInstall,
      extensionsJsPath
    );

    return installer.installExtensions(isProduction)
      .then((installedExtensions) => {
        const appBinaryConfigurator = new AppBinaryConfigurator(buildConfig);
        const extensionsJs = installer.createExtensionsJs(installedExtensions);
        const preBuild = this.executeBuildLifecycleHook(installedExtensions, 'preBuild');

        let configureProject;

        if (!skipNativeDependencies) {
          const linkableExtensions = skipLinking ?
            [] : _.filter(installedExtensions, isExtensionLinkable);

          configureProject = appBinaryConfigurator.customizeProject()
            .then(() => installer.installNativeDependencies(installedExtensions))
            .then(() => this.reactNativeLinkExtensions(linkableExtensions))
            .then(() => appBinaryConfigurator.configureApp());
        } else if (isProduction) {
          // rename the root view for republish build
          configureProject = appBinaryConfigurator.customizeProject()
        }

        return Promise.all([extensionsJs, preBuild, configureProject]);
      });
  }

  executeBuildLifecycleHook(extensions, lifeCycleStep) {
    const appDir = process.cwd();
    const buildStepWrapperPath = path.resolve(appDir, 'scripts', 'helpers', 'build-step-wrapper.js');

    return new Promise((resolve) => {
      console.log(`[${lifeCycleStep.bold}] - all`);
      console.time(`[${lifeCycleStep.bold}]`);

      _.forEach(extensions, (extension) => {
        if (extension && extension.id) {
          try {
            const buildPath = path.join(extension.id, 'build');
            const build = require(buildPath);
            const buildLifeCycle = _.get(build, lifeCycleStep);

            if (!_.isFunction(buildLifeCycle)) {
              throw new Error(`[running ${lifeCycleStep}] - ${extension.id} - Invalid export, expected a function.`);
            }

            // extension build hooks expect to be run in their own folder
            const options = { stdio: 'inherit', cwd: path.join(appDir, 'node_modules', extension.id) };
            const execArgs = [buildStepWrapperPath, '--lifeCycleStep', `${lifeCycleStep}`];
            const logString = `[${lifeCycleStep}] - ${extension.id}`;

            console.log(logString);
            console.time(logString);

            // When trying to execute js scripts, the first exec argument must
            // be 'node' for Windows compatibility. Calling exec directly on a
            // file path will result in an 'UNKNOWN' error on Windows.
            execFileSync('node', execArgs, options);

            console.timeEnd(logString);
          } catch (e) {
            // we only ignore invalid `require`
            // build might not exist
            if (e.code !== 'MODULE_NOT_FOUND') {
              throw new Error(e);
            }
          }
        }
      });

      console.timeEnd(`[${lifeCycleStep.bold}]`);
      resolve();
    });
  }

  removeBabelrcFiles() {
    console.time('Removing .babelrc files'.bold.green);

    rimraf.sync(path.join('.', 'node_modules', '*', '.babelrc'));

    console.timeEnd('Removing .babelrc files'.bold.green);
    console.log('');
  }

  cleanTempFolder() {
    console.time('Cleaning temp files'.bold.green);

    rimraf.sync(path.join('.', 'temp', '*'));

    console.timeEnd('Cleaning temp files'.bold.green);
  }

  prepareConfiguration() {
    if (this.buildConfig.offlineMode) {
      const configuration = require(path.resolve(this.buildConfig.configurationFilePath));
      this.configuration = configuration;

      // Nothing to do, resolve to proceed with next build step
      return Promise.resolve(configuration);
    }

    return this.downloadConfiguration();
  }

  updateGoogleServicesPackageName() {
    const relativePath = path.join('android', 'app', 'google-services.json');
    const filePath = path.join(process.cwd(), relativePath);
    const pkgName = 'com.shoutemapp';
    const message = `Updating ${relativePath} package_name to ${pkgName}`.bold.green;
    const { production, release } = this.buildConfig;

    console.time(message);

    return new Promise((resolve, reject) => {
      fs.open(filePath, 'r', (err, fd) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.log(`${relativePath} does not exist, moving on...`);
            return resolve();
          }

          return reject(err);
        }

        // don't throw on invalid json, rather check if the output is `null`
        const data = fs.readJsonSync(filePath, { throws: false });

        if (data === null) {
          console.log(`${relativePath} is invalid or empty - please check your shoutem.firebase configuration!`);
          return resolve();
        }

        // only update android package on non-production builds
        if (!production && !release) {
          data.client[0].client_info.android_client_info.package_name = pkgName;
        }

        fs.writeJson(filePath, data)
          .then(() => console.timeEnd(message))
          .then(resolve);
      });
    })
  }

  buildExtensions() {
    return this.prepareExtensions()
      .then(() => this.updateGoogleServicesPackageName())
      .then(() => this.removeBabelrcFiles());
  }

  reactNativeLinkExtensions(extensions) {
    if (!extensions.length) {
      return Promise.resolve(extensions);
    }

    return Promise.all(
      extensions.map((ext) => this.runReactNativeLink(ext.id, 'sync'))
    );
  }

  runReactNativeLink(packageName = '', sync) {
    console.log(`react-native link ${packageName}`.bold);

    const spawner = sync ? spawnSync : spawn;

    return spawner('node', [reactNativeCli, 'link', packageName], {
      stdio: ['ignore', 'inherit', 'inherit'],
      cwd: process.cwd()
    });
  }

  run() {
    console.time('Build time'.bold.green);
    console.log('Starting build for app', `${this.buildConfig.appId}`.bold.cyan);

    // clear any previous build's temp files
    this.cleanTempFolder();

    return this.prepareConfiguration()
      .then(this.saveConfigurationFiles)
      .then(this.buildExtensions)
      .then(() => {
        console.timeEnd('Build time'.bold.green);
      })
      .then(() => applyReactNativeFixes())
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
  }
}

module.exports = AppConfigurator;
