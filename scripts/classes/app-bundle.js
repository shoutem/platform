'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const exec = require('child_process').exec;

const bundleNameGenerators = {
  ios: () => 'main.jsbundle',
};

class AppBundle {
  constructor(config) {
    this.config = _.assign({}, config);
  }

  getOutputDirectory() {
    return this.config.outputDirectory || path.join('temp', `${this.config.appId}`);
  }

  getEntryFileName() {
    return `index.${this.config.platform}.js`;
  }

  getBundleName() {
    const platform = this.config.platform;
    const defaultNameGenerator = (p) => `index.${p}.bundle`;

    return _.get(bundleNameGenerators, platform, defaultNameGenerator)(platform);
  }

  createReactNativeBundle() {
    console.log('Starting react-native bundle\n');
    console.time('Build bundle');
    const assetsDest = this.getOutputDirectory();
    const bundleOutput = path.join(assetsDest, this.getBundleName());
    const platform = this.config.platform;
    const dev = this.config.debug;
    const entryFile = this.getEntryFileName();
    const rnBundleCommand = [
      'react-native',
      'bundle',
      `--assets-dest ${assetsDest}`,
      `--bundle-output ${bundleOutput}`,
      `--platform ${platform}`,
      `--dev ${dev}`,
      `--entry-file ${entryFile}`,
    ];

    fs.ensureDirSync(assetsDest);
    return new Promise((resolve, reject) => {
      const reactNativeBundleProcess = exec(rnBundleCommand.join(' '), error => {
        console.timeEnd('Build bundle');
        console.log('');
        if (error !== null) {
          console.log(`Bundling error: ${error}`);
          reject(error);
        }
        resolve(assetsDest);
      });

      reactNativeBundleProcess.stdout.pipe(process.stdout);
      reactNativeBundleProcess.stderr.pipe(process.stderr);
    });
  }
}

module.exports = AppBundle;
