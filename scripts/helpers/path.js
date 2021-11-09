const path = require('path');
const projectPath = require('./get-project-path');
const s = '/';
const bs = '\\';
const sep = path.sep === s ? s : bs;

function slash(str) {
  return path.normalize(str).replace(/\\/g, s);
}

function backSlash(str) {
  return slash(str).replace(/\/+/g, bs);
}

function systemSlash(str) {
  return slash(str).replace(/\/+/g, sep);
}

function shortPath(str) {
  const slashed = systemSlash(str);

  return slash(slashed.replace(projectPath, ''));
}

function prependProjectPath(str) {
  const slashed = systemSlash(str);

  if (slashed.indexOf(projectPath) === 0) {
    return str;
  }

  return path.normalize(path.join(projectPath, systemSlash(str)));
}

module.exports = {
  slash,
  backSlash,
  systemSlash,
  shortPath,
  prependProjectPath,
};
