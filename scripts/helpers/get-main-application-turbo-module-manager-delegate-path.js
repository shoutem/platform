'use strict';
const path = require('path');
const { systemSlash } = require('./path');

function getMainApplicationTurboModuleManagerDelegatePath(
  options = { cwd: '.' },
) {
  return systemSlash(
    path.resolve(
      options.cwd,
      'android/app/src/main/java/com/shoutemapp/newarchitecture/modules/MainApplicationTurboModuleManagerDelegate.java',
    ),
  );
}

module.exports = getMainApplicationTurboModuleManagerDelegatePath;
