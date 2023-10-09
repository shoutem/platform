#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const getPlatformDependencies = require('./helpers/get-platform-dependencies');

const platformPath = path.resolve(path.join('../platform', 'platform.json'));
const platformJson = fs.readJsonSync(platformPath);
const extensionsToIgnore = [
  'affiliate',
  'age-restriction',
  'agora',
  'advertising',
  'bands-in-town',
  'besttime',
  'books',
  'checklist',
  'geo-restrictions',
  'ginger',
  'in-app-purchases',
  'interactive-faq',
  'intercom',
  'invision-community',
  'menu',
  'onboarding',
  'podcast',
  'radio-player',
  'recombee',
  'salesforce',
  'sendbird',
  'shopify',
];

platformJson.dependencies = getPlatformDependencies(
  process.argv[2],
  extensionsToIgnore,
);
fs.writeJsonSync(platformPath, platformJson, { spaces: 2 });
