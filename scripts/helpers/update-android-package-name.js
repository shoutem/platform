const fs = require('fs-extra');

const getAndroidManifestpath = require('./get-android-manifest-path');
const getBuckPath = require('./get-buck-path');
const getMainActivityPath = require('./get-main-activity-path');
const getMainApplicationPath = require('./get-main-application-path');
const getMainApplicationReactNativeHostPath = require('./get-main-application-react-native-host-path');
const getMainComponentsRegistryPath = require('./get-main-components-registry-path');
const getMainApplicationTurboModuleManagerDelegatePath = require('./get-main-application-turbo-module-manager-delegate-path');

function getSearchReplaceFiles(oldPackageName, newPackageName) {
  return [
    {
      path: getBuckPath(),
      search: new RegExp(`package = "${oldPackageName}"`, 'g'),
      replace: `package = "${newPackageName}"`,
      fileName: 'BUCK',
    },
    {
      path: getAndroidManifestpath(),
      search: `package="${oldPackageName}"`,
      replace: `package="${newPackageName}"`,
      fileName: 'AndroidManifest.xml',
    },
    {
      path: getMainActivityPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainActivity.java',
    },
    {
      path: getMainApplicationPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainApplication.java',
    },
    {
      path: getMainApplicationReactNativeHostPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainApplicationReactNativeHost.java',
    },
    {
      path: getMainComponentsRegistryPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainComponentsRegistry.java',
    },
    {
      path: getMainApplicationTurboModuleManagerDelegatePath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainApplicationTurboModuleManagerDelegate.java',
    },
  ];
}

function updateAndroidPackageName(oldPackageName, newPackageName) {
  const files = getSearchReplaceFiles(oldPackageName, newPackageName);

  files.forEach(file => {
    const fileContents = fs.readFileSync(file.path, 'utf8');
    const newFileContents = fileContents.replace(file.search, file.replace);
    fs.writeFileSync(file.path, newFileContents);
  });
}

module.exports = updateAndroidPackageName;
