const fs = require('fs-extra');

const getAppGradlePath = require('./get-app-gradle-path');
const getMainActivityPath = require('./get-main-activity-path');
const getMainApplicationPath = require('./get-main-application-path');
const getMainApplicationReactNativeHostPath = require('./get-main-application-react-native-host-path');
const getMainComponentsRegistryPath = require('./get-main-components-registry-path');
const getMainApplicationTurboModuleManagerDelegatePath = require('./get-main-application-turbo-module-manager-delegate-path');

function getSearchReplaceFiles(oldPackageName, newPackageName) {
  return [
    {
      path: getAppGradlePath(),
      search: `namespace "${oldPackageName}"`,
      replace: `namespace "${newPackageName}"`,
      fileName: 'app/build.gradle',
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
      path: getMainApplicationReactNativeHostPath(),
      search: `import ${oldPackageName}`,
      replace: `import ${newPackageName}`,
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
