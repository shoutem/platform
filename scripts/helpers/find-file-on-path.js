'use strict';

const _ = require('lodash');
const glob = require('glob');

function findFileOnPath(fileName, sourcePath) {
  const foundFiles = glob.sync(`${sourcePath}/?(**)/${fileName}`);
  if (_.isEmpty(foundFiles)) {
    return null;
  }

  return _.first(foundFiles);
}

module.exports = findFileOnPath;
