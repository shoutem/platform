'use strict';

const fs = require('fs');

const projectPath = require('./get-project-path');
const getPackageJsonPath = require('./get-package-json-path');

const packageJsonPath = getPackageJsonPath({ cwd: projectPath });

function addDependencyToPackageJson(packageJson, name, version) {
  // eslint-disable-next-line no-param-reassign
  packageJson.dependencies[name] = version;
}

function writePackageJson(content, path) {
  const json = JSON.stringify(content, null, 2);

  return new Promise((resolve, reject) => {
    fs.writeFile(path, json, err => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

function addPackageJsonDependency(name, version) {
  const packageJson = fs.readJsonSync(packageJsonPath);

  addDependencyToPackageJson(packageJson, name, version);

  return writePackageJson(packageJson, packageJsonPath)
    .then(() => console.log(
        `Adding dependency to package.json "${name}": "${version}" - [OK].`,
      ))
    .catch((err) => console.log(
        `Adding dependency to package.json "${name}": "${version}" - [Error].`,
        err,
      ));
}

module.exports = addPackageJsonDependency;
