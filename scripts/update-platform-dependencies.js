#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const getPlatformDependencies = require('./helpers/get-platform-dependencies');

const platformPath = path.resolve(path.join('../platform', 'platform.json'));
const platformJson = fs.readJsonSync(platformPath);
const extensionsToIgnore = [
  "firebase",
  "hello-world",
  "react-hello-world",
  "ui-examples",
];

platformJson.dependencies = getPlatformDependencies(process.argv[2], extensionsToIgnore);
fs.writeJsonSync(platformPath, platformJson, { spaces: 2 });
