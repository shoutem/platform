const fs = require('fs-extra');
const glob = require('glob');
const _ = require('lodash');
const path = require('path');

function createDependenciesJson() {
  const paths = glob.sync(path.join('..', 'extensions', '*'));

  let dependencies = {};
  const allNativeDependencies = [];

  paths.forEach(extensionPath => {
    const stat = fs.statSync(extensionPath);

    if (stat && stat.isDirectory()) {
      try {
        const appPackageJsonPath = path.resolve(
          path.join(extensionPath, 'app', 'package.json'),
        );
        const extensionJsonPath = path.resolve(
          path.join(extensionPath, 'extension.json'),
        );
        const appPackageJsonStat = fs.statSync(appPackageJsonPath);

        if (appPackageJsonStat && appPackageJsonStat.isFile()) {
          const appPackageJson = fs.readJsonSync(appPackageJsonPath);

          if (appPackageJson.dependencies) {
            dependencies = { ...dependencies, ...appPackageJson.dependencies };
          }

          if (appPackageJson.nativeDependencies) {
            appPackageJson.nativeDependencies.forEach(nativeDep =>
              allNativeDependencies.push(nativeDep),
            );
          }
        }
      } catch (error) {
        console.log(`Failed to load ${extensionPath} with error: ${error}`);
        process.exit(1);
      }
    }
  });

  allNativeDependencies.sort();

  let nativeDependencies;
  _.uniq(allNativeDependencies).forEach(nativeDep => {
    nativeDependencies = {
      ...nativeDependencies,
      [nativeDep]: dependencies[nativeDep],
    };
  });

  fs.writeJsonSync('dependencies.json', dependencies, { spaces: 2 });
  fs.writeJsonSync('nativeDependencies.json', nativeDependencies, {
    spaces: 2,
  });
}

createDependenciesJson();
