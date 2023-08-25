const fs = require('fs-extra');

const getAppGradlePath = require('./get-app-gradle-path');
const getMainActivityPath = require('./get-main-activity-path');
const getMainApplicationPath = require('./get-main-application-path');

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

  files.forEach(file => {
    const fileContents = fs.readFileSync(file.path, 'utf8');
    const newFileContents = fileContents.replace(file.search, file.replace);
    fs.writeFileSync(file.path, newFileContents);
  });
}

module.exports = updateAndroidPackageName;
