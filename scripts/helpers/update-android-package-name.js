const fs = require('fs-extra');

const getAppGradlePath = require('./get-app-gradle-path');
const getMainActivityPath = require('./get-main-activity-path');
const getMainApplicationPath = require('./get-main-application-path');
require('colors');

function getSearchReplaceFiles(oldPackageName, newPackageName) {
  return [
    {
      path: getAppGradlePath(),
      search: `namespace "${oldPackageName}"`,
      replace: `namespace "${newPackageName}"`,
      fileName: 'build.gradle',
    },
    {
      path: getMainActivityPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainActivity.kt',
    },
    {
      path: getMainApplicationPath(),
      search: `package ${oldPackageName};`,
      replace: `package ${newPackageName};`,
      fileName: 'MainApplication.kt',
    },
  ];
}

function updateAndroidPackageName(oldPackageName, newPackageName) {
  console.log(`TEST---updateAndroidPackageName`.bold.red);
  
  const files = getSearchReplaceFiles(oldPackageName, newPackageName);

  files.forEach((file) => {
    console.log(`TEST--1-${file.path}`.bold.red);
    console.log(`TEST--2-${getMainActivityPath()}`.bold.red);
    console.log(`TEST--3-${getMainApplicationPath()}`.bold.red);
    const fileContents = fs.readFileSync(file.path, 'utf8');
    const newFileContents = fileContents.replace(file.search, file.replace);
    fs.writeFileSync(file.path, newFileContents);
  });
}

module.exports = updateAndroidPackageName;
