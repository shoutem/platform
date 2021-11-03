'use strict';

const _ = require('lodash');
const path = require('path');
const spawn = require('child-process-promise').spawn;
const fs = require('fs-extra');
const isWindows = require('../helpers/is-windows');
const findFileOnPath = require('../helpers/find-file-on-path');

const buildHandlers = {
  ios() {
    const outputDir = this.getOutputDirectory();
    const configuration = this.config.configuration || 'Release';
    const schemaFile = findFileOnPath(
      'xcshareddata/xcschemes/*.xcscheme',
      'ios',
    );
    const schemaName = path.basename(schemaFile).split('.')[0];
    const workspacePath = findFileOnPath('*.xcworkspace', '.');
    const archivePath = path.join(outputDir, 'ShoutemApp.xcarchive');
    const appFilePath = path.join(
      archivePath,
      'Products',
      'Applications',
      `${schemaName}.app`,
    );
    const swiftSupportPath = path.join(archivePath, 'SwiftSupport');
    const swiftSupportDestination = path.join(outputDir, 'SwiftSupport');
    const payloadPath = path.join(
      outputDir,
      'Payload',
      path.basename(appFilePath),
    );

    const stdArgs = {
      stderr: 'inherit',
      stdio: 'inherit',
    };

    const zipStdArgs = {
      stderr: 'inherit',
      stdio: 'inherit',
      cwd: outputDir,
    };

    const zipArgs = ['-r', '-X', 'ShoutemApp.ipa', 'Payload', 'SwiftSupport'];

    const xcodeArgs = [
      'archive',
      '-workspace',
      workspacePath,
      '-scheme',
      schemaName,
      '-configuration',
      configuration,
      '-archivePath',
      archivePath,
      'CODE_SIGNING_ALLOWED=NO',
      'CODE_SIGNING_REQUIRED=NO',
      'CODE_SIGN_IDENTITY=',
    ];

    return spawn('xcodebuild', xcodeArgs, stdArgs)
      .then(() => fs.copy(appFilePath, payloadPath))
      .then(() => fs.copy(swiftSupportPath, swiftSupportDestination))
      .then(() => spawn('zip', zipArgs, zipStdArgs));
  },

  android() {
    const outputDir = this.getOutputDirectory();
    const gradlew = isWindows() ? 'gradlew' : './gradlew';
    const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk');
    const stdArgs = {
      stderr: 'inherit',
      stdio: 'inherit',
      cwd: 'android',
    };

    return spawn(gradlew, ['assembleUnsignedRelease'], stdArgs).then(() => {
      console.log(`Copying .apk to ${outputDir}`);
      fs.copySync(apkPath, outputDir);
    });
  },
};

class AppBuilder {
  constructor(config) {
    this.config = _.assign({}, config);
  }

  getOutputDirectory() {
    return (
      this.config.outputDirectory || path.join('temp', `${this.config.appId}`)
    );
  }

  build() {
    return buildHandlers[this.config.platform].bind(this)();
  }
}

module.exports = AppBuilder;
