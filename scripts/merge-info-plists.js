#!/usr/bin/env node

const fs = require('fs-extra');
const glob = require('glob');
const _ = require('lodash');
const plist = require('plist');

function parsePlist(plistPath) {
  const plistContent = fs.readFileSync(plistPath, 'utf8');
  let plistResult = {};
  try {
    plistResult = plist.parse(plistContent);
  } catch (e) {
    console.log('Unable to parse plist', plistPath);
  }
  return plistResult;
}

const projectInfoPlistPath = _.first(glob.sync('?(**)/Info.plist'));

if (!projectInfoPlistPath) {
  console.error('Project Info.plist not found!');
  process.exit(1);
}

const projectPlist = parsePlist(projectInfoPlistPath);

const infoPlistFiles = glob.sync('../extensions/?(**)/app/ios/Info.plist');

const extensionsPlist = _.reduce(infoPlistFiles, (finalPlist, extPlistPath) => {
  const extPlist = parsePlist(extPlistPath);
  return _.merge(finalPlist, extPlist);
}, projectPlist);

fs.writeFileSync(projectInfoPlistPath, plist.build(extensionsPlist));
