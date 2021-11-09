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
    return (
      this.config.outputDirectory || path.join('temp', `${this.config.appId}`)
    );
  }

  getEntryFileName() {
    return `index.${this.config.platform}.js`;
  }

  getBundleName() {
    const platform = this.config.platform;
    const defaultNameGenerator = p => `index.${p}.bundle`;

    return _.get(
      bundleNameGenerators,
      platform,
      defaultNameGenerator,
    )(platform);
  }

  createReactNativeBundle() {
    console.log('Starting react-native bundle\n');
    console.time('Build bundle');
    // Due to how the 'bundle' scripts are chained through the build system, we have to rename the
    // property here. This is currently passed from build system variables, to a build system script
    // then to the platform's bundle script, which then runs the app-bundler with a config
    // containing 'reset-cache'.
    const {
      debug: dev,
      platform,
      'reset-cache': shouldResetBundleCache,
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

    const rnBundleCommand = ['react-native', 'bundle', ...rnBundleArgs].join(
      ' ',
    );

    fs.ensureDirSync(assetsDest);

    return new Promise((resolve, reject) => {
      const rnBundleProcess = exec(rnBundleCommand, err => {
        console.timeEnd('Build bundle');

        if (err !== null) {
          console.log(`Bundling error: ${err}`);
          return reject(err);
        }

        return resolve(assetsDest);
      });

      rnBundleProcess.stdout.pipe(process.stdout);
      rnBundleProcess.stderr.pipe(process.stderr);
    });
  }
}

module.exports = AppBundler;
