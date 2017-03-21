/* eslint global-require: "off" */
/* global require needs to be enabled because files to be required are
 * determined dynamically
*/

'use strict';

const shell = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const rimraf = require('rimraf');
const process = require('process');
const request = require('request');


const getLocalExtensions = require('./../helpers/get-local-extensions');
const ExtensionsInstaller = require('./extensions-installer.js');
const buildApiEndpoint = require('./../helpers/build-api-endpoint');
const getExtensionsFromConfiguration = require('./../helpers/get-extensions-from-configuration');

const reactNativeLocalCli = `node node_modules/react-native/local-cli/cli.js`;

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
  constructor(config) {
    this.buildConfig = _.assign({}, config);
  }

  getConfigurationUrl() {
    const serverApiEndpoint = this.buildConfig.serverApiEndpoint;
    const appId = this.buildConfig.appId;
    const production = this.buildConfig.production;
    const path = `configurations/current`;

    return buildApiEndpoint(serverApiEndpoint, appId, path, production);
  }

  downloadConfiguration() {
    console.time('download configuration');
    return new Promise((resolve, reject) => {
      request.get({
        url: this.getConfigurationUrl(),
        headers: {
          Accept: 'application/vnd.api+json',
          Authorization: `Bearer ${this.buildConfig.authorization}`,
        },
      }, (error, response, body) => {
        if (response.statusCode === 200) {
          const configuration = JSON.parse(body);
          console.timeEnd('download configuration');
          this.configuration = configuration;
          resolve(configuration);
        } else {
          reject('Configuration download failed!');
        }
      }).on('error', err => {
        reject(err);
      });
    });
  }

  prepareExtensions() {
    const extensions = getExtensionsFromConfiguration(this.configuration);
    const localExtensions = getLocalExtensions(this.buildConfig.workingDirectories);
    const extensionsJsPath = this.buildConfig.extensionsJsPath;
    const platform = this.buildConfig.platform;
    const installer = new ExtensionsInstaller(
      localExtensions,
      extensions,
      extensionsJsPath
    );

    return installer.installExtensions(this.buildConfig.production)
      .then((extensions) => {
        const extensionsJs = installer.createExtensionsJs(extensions);
        const preBuild = this.executeBuildLifecycleHook(extensions, 'preBuild');
        let installNativeDependencies;

        if (!this.buildConfig.skipNativeDependencies) {
          installNativeDependencies = installer.installNativeDependencies(extensions, platform)
            .then(() => this.runReactNativeLink());
        }

        return Promise.all([extensionsJs, preBuild, installNativeDependencies]);
      });
  }

  executeBuildLifecycleHook(extensions, lifeCycleStep) {
    console.time(`${lifeCycleStep}`);
    _.forEach(extensions, (extension) => {
      if (extension && extension.id) {
        try {
          const build = require(path.join(extension.id, 'build.js'));
          const buildLifeCycle = _.get(build, lifeCycleStep);
          if (_.isFunction(buildLifeCycle)) {
            const initialWorkingDirectory = process.cwd();
            // run extension build hook in its own folder
            console.time(`[running ${lifeCycleStep}] - ${extension.id}`);
            process.chdir(path.join('node_modules', extension.id));
            buildLifeCycle(this.configuration, this.buildConfig);
            // return to the build script original working directory
            console.timeEnd(`[running ${lifeCycleStep}] - ${extension.id}`);
            process.chdir(initialWorkingDirectory);
          }
        } catch (e) {
          if (e.code !== 'MODULE_NOT_FOUND') {
            console.log(e);
            process.exit(1);
          }
        }
      }
    });
    console.timeEnd(`${lifeCycleStep}`);
    return Promise.resolve();
  }

  removeBabelrcFiles() {
    console.time('removing .babelrc files');

    rimraf.sync(path.join('.', 'node_modules', '*', '.babelrc'));

    console.timeEnd('removing .babelrc files');
    console.log('');
  }

  cleanTempFolder() {
    console.time('cleaning temp files');
    rimraf.sync(path.join('.', 'temp', '*'));
    console.timeEnd('cleaning temp files');
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

  buildExtensions() {
    return this.prepareExtensions().then(() => this.removeBabelrcFiles());
  }

  runReactNativeLink() {
    return new Promise((resolve, reject) => {
      shell.exec(`${reactNativeLocalCli} link`,  (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  run() {
    console.time('build time');
    console.log(`starting build for app ${this.buildConfig.appId}`);
    // clear any previous build's temp files
    this.cleanTempFolder();
    return this.prepareConfiguration()
      .then(() => this.buildExtensions())
      .then(() => {
        console.timeEnd('build time');
        if (this.buildConfig.workingDirectories.length) {
          const runWatchInNewWindow = require('./../helpers/run-watch-in-new-window.js');
          runWatchInNewWindow();
        }
      })
      .catch((e) => {
        console.log(e);
        process.exit(1);
      });
  }
}

module.exports = AppConfigurator;
