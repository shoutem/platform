'use strict';

const _ = require('lodash');
const glob = require('glob');
const { slash } = require('./path');

// Directories that can contain files matching the same names as the app's own native
// files (Pods generates its own project.pbxproj and hundreds of Info.plist files, build
// output mirrors the app tree). Without ignoring them, a stale ios/Pods left over from a
// previous configure wins the glob - 'ios/Pods' sorts before 'ios/ShoutemApp' - and every
// caller silently resolves the wrong file.
const IGNORED_DIRECTORIES = [
  '**/Pods/**',
  '**/build/**',
  '**/node_modules/**',
  '**/DerivedData/**',
];

/**
 * Finds the first file matching the given name anywhere under the source path, ignoring
 * generated and vendored directories so that only the app's own native files match.
 *
 * @param {String} fileName File name to search for; may be a glob (e.g. '*.xcworkspace').
 * @param {String} sourcePath Directory to search recursively.
 * @returns {String|null} Path to the first match, or null when nothing matches.
 */
function findFileOnPath(fileName, sourcePath) {
  const searchGlob = slash(`${sourcePath}/**/${fileName}`);
  const foundFiles = glob.sync(searchGlob, { ignore: IGNORED_DIRECTORIES });

  if (_.isEmpty(foundFiles)) {
    return null;
  }

  return _.first(foundFiles);
}

module.exports = findFileOnPath;
