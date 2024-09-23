/* eslint global-require: "off" */
/* global requre needs to be enabled because files to be required are
 * determined dynamically
 */

'use-strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');

function writeJson(content, filePath) {
  const json = JSON.stringify(content, null, 2);

  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, json, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function substituteWebDependencies(isWeb = false, packageJson = {}) {
  if (!isWeb) {
    return packageJson;
  }

  const resultPackageJson = { ...packageJson };
  const { webDependencies } = packageJson;

  if (!webDependencies || _.isEmpty(webDependencies)) {
    resultPackageJson.dependencies = {};
  } else {
    resultPackageJson.dependencies = webDependencies;
  }

  return resultPackageJson;
}

/**
 * Gets collection of all local extensions where
 * collection item has {String} name and {String} path keys
 * @param {Array} workingDirectories array of all paths
 * that need to be watched and installed in projects' node_modules folder
 */
function getLocalExtensions(workingDirectories, platform) {
  const isWeb = platform === 'web';
  const promiseMap = [];

  console.time('Load local extensions'.bold.green);

  [].concat(workingDirectories).forEach((workDirPattern) => {
    const paths = glob.sync(path.join(workDirPattern, '/app'));

    paths.forEach(packagePath => {
      const stat = fs.statSync(packagePath);

      async function producePromise() {
        try {
          const packageJsonPath = path.resolve(
            path.join(packagePath, 'package.json'),
          );
          const packageStat = fs.statSync(packageJsonPath);

          if (packageStat && packageStat.isFile()) {
            const packageJson = require(packageJsonPath);

            const resultPackageJson = substituteWebDependencies(
              isWeb,
              packageJson,
            );

            if (isWeb) {
              await writeJson(resultPackageJson, packageJsonPath);
            }

            const packageName = resultPackageJson.name;
            const packageDependencies = resultPackageJson.dependencies;

            return {
              id: packageName,
              path: packagePath,
              isNative: !_.isEmpty(resultPackageJson.rnpm),
              dependencies: packageDependencies,
            };
          }
        } catch (error) {
          console.log(
            `Failed to load ${packagePath} with error:`.bold.red,
            `${error}`,
          );
          process.exit(1);
        }
      }

      if (stat && stat.isDirectory()) {
        promiseMap.push(producePromise());
      }
    });
  });

  return Promise.all(promiseMap).then(results => {
    console.timeEnd('Load local extensions'.bold.green);
    return results;
  });
}

module.exports = getLocalExtensions;
