const fs = require('fs-extra');
const path = require('path');

const getAndroidManifestpath = require('./get-android-manifest-path');
const getBuckPath = require('./get-buck-path');
const getMainActivityPath = require('./get-main-activity-path');
const getMainApplicationPath = require('./get-main-application-path');
const getFlipperJavaPath = require('./get-flipper-java-path');

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
      path: getMainApplicationPath(),
      search: `Class<?> aClass = Class.forName("${oldPackageName}.ReactNativeFlipper");`,
      replace: `Class<?> aClass = Class.forName("${newPackageName}.ReactNativeFlipper");`,
      fileName: 'MainApplication.java',
    },
    {
      path: getFlipperJavaPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'ReactNativeFlipper.java',
    }
  ];
}

function updateAndroidPackageName(oldPackageName, newPackageName) {
  const files = getSearchReplaceFiles(oldPackageName, newPackageName);

  files.forEach((file) => {
    const fileContents = fs.readFileSync(file.path, 'utf8');
    const newFileContents = fileContents.replace(file.search, file.replace);
    fs.writeFileSync(file.path, newFileContents);
  });
}

module.exports = updateAndroidPackageName;
