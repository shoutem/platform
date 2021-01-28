'use strict';

const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

const bundleNameGenerators = {
  ios: () => 'main.jsbundle',
};

class AppBundler {
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
    const {
      debug: dev,
      platform,
      shouldResetBundleCache = false,
    } = this.config;

    const assetsDest = this.getOutputDirectory();
    const bundleOutput = path.join(assetsDest, this.getBundleName());
    const entryFile = this.getEntryFileName();
    const rnBundleArgs = [
      `--assets-dest ${assetsDest}`,
      `--bundle-output ${bundleOutput}`,
      `--platform ${platform}`,
      `--dev ${dev}`,
      `--entry-file ${entryFile}`,
    ];

    if (shouldResetBundleCache) {
      rnBundleArgs.push('--reset-cache');
    }

    const rnBundleCommand = [
      'react-native',
      'bundle',
      ...rnBundleArgs,
    ].join(' ');

    fs.ensureDirSync(assetsDest);

    return new Promise((resolve, reject) => {
      const rnBundleProcess = exec(rnBundleCommand, (err, stdout, stderr ) => {
        console.timeEnd('Build bundle');

        if (err !== null) {
          console.log(`Bundling error: ${err}`);
          return reject(err);
        }
        resolve(assetsDest);
      });

      rnBundleProcess.stdout.pipe(process.stdout);
      rnBundleProcess.stderr.pipe(process.stderr);
    });
  }
}

module.exports = AppBundler;
