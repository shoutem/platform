const fs = require('fs-extra');
const path = require('path');

const getAndroidManifestpath = require('./get-android-manifest-path');
const getBuckPath = require('./get-buck-path');
const getMainActivityPath = require('./get-main-activity-path');
const getMainApplicationPath = require('./get-main-application-path');

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
  ];
}

function updateAndroidPackageName(oldPackageName, newPackageName) {
  const files = getSearchReplaceFiles(oldPackageName, newPackageName);

  files.forEach((file) => {
    const fileContents = fs.readFileSync(file.path, 'utf8');
    const newFileContents = fileContents.replace(file.search, file.replace);
    fs.writeFileSync(file.path, newFileContents);
    console.log(`Updated packageName ${oldPackageName} to ${newPackageName} in ${file.fileName}`);
  });
}

module.exports = updateAndroidPackageName;
