'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getMainComponentsRegistry(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(
      options.cwd,
      'android/app/src/main/java/com/shoutemapp/newarchitecture/components/MainComponentsRegistry.java',
    ),
  );
}

module.exports = getMainComponentsRegistry;
