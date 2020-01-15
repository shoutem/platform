const fs = require('fs-extra');

const DEPENDENCIES_FILE_PATH = './dependencies.json';
const EXT_PATH_ROOT = './extensions/';
const EXT_PACKAGE_PATH = '/app/package.json';
const PACKAGE_STRING = 'package.json';
const PLATFORM_PATH = './platform/platform.json';

// returns array of extensions from platform.json dependencies
function fetchPlatformExtensions() {
  const platformJson = fs.readJsonSync(PLATFORM_PATH);

  return Object.keys(platformJson.dependencies);
}

// returns all extensions found in the ./extensions directory
// currently unused due to deprecated extensions in the directory
function fetchAllExtensions() {
  const listOfExtensions = fs.readdirSync(EXT_PATH_ROOT, { withFileTypes: true })
    .filter(file => file.startsWith('shoutem.'))

  return listOfExtensions;
}

// returns all dependencies of a specific extension
function fetchExtensionDependencies(extName) {
  const extPackageJson = fs.readJsonSync(EXT_PATH_ROOT + extName + EXT_PACKAGE_PATH);

  return extPackageJson.dependencies;
}

// returns all dependencies specified in root app package.json
function fetchPlatformDependencies() {
  const platformPackageJson = fs.readJsonSync(PACKAGE_STRING);

  return platformPackageJson.dependencies;
}

function makeList() {
  const listOfExtensions = fetchPlatformExtensions();

  let listOfDependencies = {};
  listOfExtensions.forEach(extension => {
    const extName = extension === 'shoutem.video' ? 'shoutem.videos' : extension;

    listOfDependencies = {
      ...listOfDependencies,
      ...fetchExtensionDependencies(extName),
    };
  });

  listOfDependencies = {
    ...listOfDependencies,
    ...fetchPlatformDependencies(),
  }

  const list = JSON.stringify(listOfDependencies, Object.keys(listOfDependencies).sort(), 2);

  fs.writeFileSync(DEPENDENCIES_FILE_PATH, list);
  console.log("Wrote list of platform and extension dependencies into 'dependencies.json'");
}

makeList();
