const { execSync } = require('child_process');
const fs = require('fs-extra');
const { prependProjectPath } = require('./helpers');

const NODE_MODULES_DIR = prependProjectPath('node_modules');

// returns all downloaded extensions found in the extensions directory
function fetchAllExtensions() {
  const extensionsDir = prependProjectPath('extensions');

  const listOfExtensions = fs.readdirSync(
    prependProjectPath('extensions'),
    { withFileTypes: true },
  ).filter(file => {
    // Depending on the environment's OS, 'file' can be an object or just the
    // name string, so we do an explicit check
    if (typeof file === 'object' && file !== null) {
      return fs.lstatSync(`${extensionsDir}/${file.name}`).isDirectory();
    }

    return fs.lstatSync(`${extensionsDir}/${file}`).isDirectory()
  });

  return listOfExtensions;
}

// use patch-package to apply patches provided by extensions
function applyExtensionPatches() {
  const extensions = fetchAllExtensions();

  if (!extensions.length) {
    return;
  }

  extensions.map((extension) => {
    const patchPath = `node_modules/${extension}/patch`;

    if (!fs.existsSync(patchPath)) {
      return;
    }

    console.log(`[${extension}] - applying patches`)
    execSync(`ls ${patchPath} && npx patch-package --patch-dir ${patchPath}`);
  });
}

applyExtensionPatches();

// use jetifier to update from android.support to androidx
console.log("Jetifying node_modules");
execSync('npx jetifier');
