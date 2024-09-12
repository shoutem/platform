'use strict';

const fs = require('fs-extra');

const projectPath = require('./get-project-path');
const getWebBuildConfigPath = require('./get-web-build-config-path');

const buildConfigPath = getWebBuildConfigPath({ cwd: projectPath });

function writePackageJson(content, path) {
  fs.writeJsonSync(path, content, { spaces: 2 });
}

function addWebAliases(aliases = {}) {
  let buildConfigJson = {};

  if (fs.existsSync(buildConfigPath)) {
    buildConfigJson = fs.readJsonSync(buildConfigPath);
  } else {
    buildConfigJson = { aliases: {} };
  }

  const modifiedConfigJson = {
    ...buildConfigJson,
    aliases: {
      ...buildConfigJson.aliases,
      ...aliases,
    },
  };

  return writePackageJson(modifiedConfigJson, buildConfigPath);
}

module.exports = addWebAliases;
