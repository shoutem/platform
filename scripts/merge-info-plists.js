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
    console.error('Unable to parse plist', plistPath);
  }
  return plistResult;
}

const projectInfoPlistPath = _.first(glob.sync('?(**)/Info.plist'));
const infoPlistWritePath = process.argv[2] || projectInfoPlistPath;

if (!projectInfoPlistPath) {
  console.error('Project Info.plist not found!');
  process.exit(1);
}

const projectPlist = parsePlist(projectInfoPlistPath);
const infoPlistFiles = glob.sync('../extensions/?(**)/app/ios/Info.plist');

/**
 * Merges all Info.plist files from extensions with one from the platform. If value of the key is
 * array it concatenate both arrays.
 */
const extensionsPlist = _.reduce(infoPlistFiles, (finalPlist, extPlistPath) => {
  const extPlist = parsePlist(extPlistPath);
  return _.mergeWith(finalPlist, extPlist, (objValue, srcValue) => {
    if (_.isArray(objValue)) {
      return _.uniq(objValue.concat(srcValue));
    }

    return srcValue;
  });
}, projectPlist);

fs.writeFileSync(infoPlistWritePath, plist.build(extensionsPlist));
