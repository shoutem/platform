'use strict';

const _ = require('lodash');
const glob = require('glob');
const { slash } = require('./path');

function findFileOnPath(fileName, sourcePath) {
  const searchGlob = slash(`${sourcePath}/?(**)/${fileName}`);
  const foundFiles = glob.sync(searchGlob);

  if (_.isEmpty(foundFiles)) {
    return null;
  }

  return _.first(foundFiles);
}

module.exports = findFileOnPath;
