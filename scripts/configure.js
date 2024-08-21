#!/usr/bin/env node

const _ = require('lodash');
// eslint-disable-next-line import/no-unresolved
const commandLineArgs = require('command-line-args');
const path = require('path');
const fs = require('fs-extra');
const AppConfigurator = require('./classes/app-configurator');

const DEFAULT_CONFIG = 'config.json';

const cliArgs = commandLineArgs([
  { name: 'configPath', type: String },
  { name: 'appId', type: Number },
  { name: 'serverApiEndpoint', type: String },
  { name: 'legacyApiEndpoint', type: String },
  { name: 'production', type: Boolean },
  { name: 'release', type: Boolean },
  { name: 'offlineMode', type: Boolean },
  { name: 'configurationFilePath', type: String },
  { name: 'workingDirectories', type: String, multiple: true },
  { name: 'extensionsJsPath', type: String },
  { name: 'platform', type: String },
  { name: 'authorization', type: String },
  { name: 'excludePackages', type: String, multiple: true },
  { name: 'binaryVersionName', type: String },
  { name: 'binaryVersionCode', type: String },
  { name: 'skipNativeDependencies', type: String },
  { name: 'bundleIdPrefix', type: String },
  { name: 'iosBundleId', type: String },
  { name: 'androidApplicationId', type: String },
  { name: 'skipIOSProjectCustomization', type: Boolean },
  { name: 'skipLinking', type: Boolean },
]);

const configPath = cliArgs.configPath || DEFAULT_CONFIG;
const config = fs.readJsonSync(path.resolve(configPath));
// merge command line arguments and config.json
// release is always set when production is true

const buildConfig = _.merge(config, cliArgs, {
  release: config.production || cliArgs.production,
});
fs.writeJsonSync(DEFAULT_CONFIG, buildConfig, { spaces: 2 });

const configure = new AppConfigurator(buildConfig);
configure.run();
