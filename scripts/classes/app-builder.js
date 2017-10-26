'use strict';

const _ = require('lodash');
const path = require('path');
const spawn = require('child-process-promise').spawn;
const fs = require('fs-extra');
const isWindows = require('../helpers/is-windows');
const findFileOnPath = require('../helpers/find-file-on-path');

const buildHandlers = {
  ios() {
    const schemaFile = findFileOnPath('xcshareddata/xcschemes/*.xcscheme', 'ios');
    const workspacePath = findFileOnPath('*.xcworkspace', '.');
    const schemaName = path.basename(schemaFile).split('.')[0];
    const archivePath = path.join(this.getOutputDirectory(), 'ShoutemApp.xcarchive');

    return spawn('xcodebuild', [
      'archive',
      '-workspace', workspacePath,
      '-scheme', schemaName,
      '-configuration', this.config.configuration || 'Release',
      '-archivePath', archivePath,
      'CODE_SIGNING_REQUIRED=NO',
      'CODE_SIGN_IDENTITY=',
    ], {
      stderr: 'inherit',
      stdio: 'inherit',
    }).then(() => {
      const appFilePath = path.join(archivePath, 'Products', 'Applications', `${schemaName}.app`);
      const payloadPath = path.join(this.getOutputDirectory(), 'Payload', path.basename(appFilePath));
      return fs.copy(appFilePath, payloadPath)
        .then(() => spawn('zip', [
          '-r',
          '-q',
          '-X',
          'ShoutemApp.ipa',
          'Payload',
        ], { stderr: 'inherit', stdio: 'inherit', cwd: this.getOutputDirectory() }))
    });
  },
  android() {
    const gradlew = isWindows() ? 'gradlew' : './gradlew';
    return spawn(gradlew, ['assembleUnsignedRelease'], {
      cwd: 'android',
      stdio: 'inherit',
      stderr: 'inherit',
    }).then(() => {
      console.log(`Copying .apk to ${this.getOutputDirectory()}`);
      const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk');
      fs.copySync(apkPath, this.getOutputDirectory());
    });
  },
};

class AppBuilder {
  constructor(config) {
    this.config = _.assign({}, config);
  }

  getOutputDirectory() {
    return this.config.outputDirectory || path.join('temp', `${this.config.appId}`);
  }

  build() {
    return buildHandlers[this.config.platform].bind(this)();
  }
}

module.exports = AppBuilder;
