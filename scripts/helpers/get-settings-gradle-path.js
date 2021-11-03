'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getSettingsGradle(options = { cwd: '.' }) {
  return systemSlash(path.resolve(options.cwd, 'android/settings.gradle'));
}

module.exports = getSettingsGradle;
