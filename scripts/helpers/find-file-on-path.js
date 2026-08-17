'use strict';

const _ = require('lodash');
const glob = require('glob');
const { slash } = require('./path');

// Directories that can contain files matching the same names as the app's own native
// files (Pods generates its own project.pbxproj and hundreds of Info.plist files, build
// output mirrors the app tree). Without ignoring them, a stale ios/Pods left over from a
// previous configure wins the glob - 'ios/Pods' sorts before 'ios/ShoutemApp' - and every
// caller silently resolves the wrong file.
//
// The patterns are anchored under `sourcePath` (see findFileOnPath) so only directories
// *below* the search root are ignored. The app itself may live in a directory with one of
// these names (build machines clone it into `build/`), and an unanchored `**/build/**`
// would then exclude every file and make every caller resolve null.
const IGNORED_DIRECTORIES = [
  '**/Pods/**',
  '**/build/**',
  '**/node_modules/**',
  '**/DerivedData/**',
];

/**
 * Finds the first file matching the given name anywhere under the source path, ignoring
 * generated and vendored directories below it so that only the app's own native files
 * match.
 *
 * @param {String} fileName File name to search for; may be a glob (e.g. '*.xcworkspace').
 * @param {String} sourcePath Directory to search recursively.
 * @returns {String|null} Path to the first match, or null when nothing matches.
 */
function findFileOnPath(fileName, sourcePath) {
  const searchGlob = slash(`${sourcePath}/**/${fileName}`);
  const ignore = IGNORED_DIRECTORIES.map(pattern =>
    slash(`${sourcePath}/${pattern}`),
  );
  const foundFiles = glob.sync(searchGlob, { ignore });

  if (_.isEmpty(foundFiles)) {
    return null;
  }

  return _.first(foundFiles);
}

module.exports = findFileOnPath;
