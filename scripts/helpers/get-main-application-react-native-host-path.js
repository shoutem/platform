'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getMainApplicationReactNativeHost(options = { cwd: '.' }) {
  return systemSlash(
    path.resolve(
      options.cwd,
      'android/app/src/main/java/com/shoutemapp/newarchitecture/MainApplicationReactNativeHost.java',
    ),
  );
}

module.exports = getMainApplicationReactNativeHost;
