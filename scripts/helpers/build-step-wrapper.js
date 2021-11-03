/**
 * This scripts expects its process.cwd() to be `node_modules/${extensionId}`
 */

const path = require('path');
const commandLineArgs = require('command-line-args');
const getBuildConfiguration = require('./get-build-configuration.js');
const getAppConfiguration = require('./get-app-configuration.js');

const cliArgs = commandLineArgs([{ name: 'lifeCycleStep', type: String }]);

const buildScriptPath = path.join(process.cwd(), 'build');
const buildScripts = require(buildScriptPath);
const buildFunc = buildScripts[`${cliArgs.lifeCycleStep}`];

const buildConfiguration = getBuildConfiguration();
const appConfiguration = getAppConfiguration();

buildFunc(appConfiguration, buildConfiguration);
