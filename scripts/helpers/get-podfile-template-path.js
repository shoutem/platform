'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getPodfileTemplatePath(options = { cwd: '.' }) {
  console.warn(
    'Deprecated: Podfile.template is no longer being used. Switch to using getPodfilePath instead of getPodfileTemplatePath. getPodfileTemplatePath will be removed on the next major platform version.',
  );
  return systemSlash(path.resolve(options.cwd, 'ios/Podfile'));
}

module.exports = getPodfileTemplatePath;
