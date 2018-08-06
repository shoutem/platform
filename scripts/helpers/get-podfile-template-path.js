'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getPodfileTemplatePath(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(options.cwd, 'ios/Podfile.template')
  );
}

module.exports = getPodfileTemplatePath;
