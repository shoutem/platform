#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const getPlatformDependencies = require('./helpers/get-platform-dependencies');

const platformPath = path.resolve(path.join('../platform', 'platform.json'));
const platformJson = fs.readJsonSync(platformPath);

platformJson.dependencies = getPlatformDependencies(process.argv[2]);

// Sync versions from dependencies
// eslint-disable-next-line arrow-parens
Object.keys(platformJson.requiredDependencies).forEach(extensionName => {
  if (platformJson.dependencies[extensionName]) {
    // eslint-disable-next-line operator-linebreak
    platformJson.requiredDependencies[extensionName] =
      platformJson.dependencies[extensionName];
  }
});

fs.writeJsonSync(platformPath, platformJson, { spaces: 2 });
