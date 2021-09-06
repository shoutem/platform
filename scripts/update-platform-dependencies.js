#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const getPlatformDependencies = require('./helpers/get-platform-dependencies');

const platformPath = path.resolve(path.join('../platform', 'platform.json'));
const platformJson = fs.readJsonSync(platformPath);
const extensionsToIgnore = [
  'agora',
  'advertising',
  'besttime',
  'books',
  'checklist',
  'interactive-faq',
  'in-app-purchases',
  'menu',
  'onboarding',
  'podcast',
  'radio',
  'radio-player',
  'sendbird',
  'shopify',
];

platformJson.dependencies = getPlatformDependencies(
  process.argv[2],
  extensionsToIgnore,
);
fs.writeJsonSync(platformPath, platformJson, { spaces: 2 });
