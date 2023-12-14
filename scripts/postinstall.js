const Promise = require('bluebird');
const util = require('util');
const fs = require('fs-extra');
const path = require('path');
const { prependProjectPath, projectPath } = require('./helpers');

const exec = util.promisify(require('child_process').exec);

// returns all downloaded extensions found in the extensions directory
function fetchAllExtensions() {
  const extensionsDir = prependProjectPath('extensions');

  const listOfExtensions = fs
    .readdirSync(prependProjectPath('extensions'), { withFileTypes: true })
    .filter(file => {
      // Depending on the environment's OS, 'file' can be an object or just the
      // name string, so we do an explicit check
      if (typeof file === 'object' && file !== null) {
        return fs.lstatSync(`${extensionsDir}/${file.name}`).isDirectory();
      }

      return fs.lstatSync(`${extensionsDir}/${file}`).isDirectory();
    });

  return listOfExtensions;
}

// use patch-package to apply patches provided by extensions
async function applyExtensionPatches() {
  const extensions = fetchAllExtensions();

  if (!extensions.length) {
    return;
  }

  console.time('Patching extension packages');
  console.log('Checking for patch-package patches...');

  await Promise.map(extensions, async extension => {
    // Depending on the environment's OS, 'extension' can be an object or just
    // the name string, so we do an explicit check
    const extensionName =
      typeof extension === 'object' ? extension.name : extension;
    const patchPath = `node_modules/${extensionName}/patch`;

    const pathExists = await fs.pathExists(patchPath);
    if (!pathExists) {
      return;
    }

    console.log(`[${extensionName}] - applying patches`);
    await exec(`node node_modules/patch-package --patch-dir ${patchPath}`, {
      cwd: projectPath,
    });
  });

  console.timeEnd('Patching extension packages');
}

async function applyPlatformPatches() {
  const patchesDir = path.join(projectPath, '/patches');

  console.time('Patching platform packages');
  console.log('Checking for patch-package patches...');

  try {
    const pathExists = await fs.pathExists(patchesDir);
    if (!pathExists) {
      return;
    }

    await exec(`node node_modules/patch-package --patch-dir patches`, {
      cwd: projectPath,
    });
  } catch (error) {
    console.log('Unable to scan patches directory: ', error);
  }

  console.timeEnd('Patching platform packages');
}

applyExtensionPatches();
applyPlatformPatches();
