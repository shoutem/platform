#!/usr/bin/env node

const _ = require('lodash');
const fs = require('fs-extra');
const AppBundle = require('./classes/app-bundle');
// eslint-disable-next-line import/no-unresolved
const commandLineArgs = require('command-line-args');
const path = require('path');
const validateArgsWithConfig = require('./helpers/validate-args-with-config');

const cli = commandLineArgs([
  { name: 'platform', type: String },
  { name: 'outputDirectory', type: String },
]);

const cliArgs = cli.parse();
const configPath = path.resolve('config.json');
const config = fs.readJsonSync(configPath);
validateArgsWithConfig(cliArgs, config);

// merge command line arguments and config.json
const buildConfig = _.merge(config, cliArgs);
const bundle = new AppBundle(buildConfig);

bundle.createReactNativeBundle();
