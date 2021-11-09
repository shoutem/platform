const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { prependProjectPath, projectPath } = require('./helpers');

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
function applyExtensionPatches() {
  const extensions = fetchAllExtensions();

  if (!extensions.length) {
    return;
  }

  console.time('Patching extension packages took');
  console.log('Checking for patch-package patches...');
  extensions.map(extension => {
    // Depending on the environment's OS, 'extension' can be an object or just
    // the name string, so we do an explicit check
    const extensionName =
      typeof extension === 'object' ? extension.name : extension;
    const patchPath = `node_modules/${extensionName}/patch`;

    if (!fs.existsSync(patchPath)) {
      return null;
    }

    console.log(`[${extensionName}] - applying patches`);
    return execSync(
      `node node_modules/patch-package --patch-dir ${patchPath}`,
      {
        cwd: projectPath,
      },
    );
  });
  console.timeEnd('Patching extension packages took');
}

function applyPlatformPatches() {
  const PATCH_FILE_EXTENSION = '.patch';
  const patchesDir = path.join(projectPath, '/patches');

  console.time('Patching platform packages took');
  console.log('Checking for patch-package patches...');

  fs.readdir(patchesDir, (error, patchFiles) => {
    if (error) {
      return console.log('Unable to scan patches directory: ', error);
    }

    const hasPatch = !!patchFiles.find(
      file => path.extname(file) === PATCH_FILE_EXTENSION,
    );

    if (hasPatch) {
      execSync(`node node_modules/patch-package --patch-dir patches`, {
        cwd: projectPath,
      });
    }
    console.timeEnd('Patching platform packages took');
  });
}

function jetify() {
  console.time('Jetified in');
  execSync('node node_modules/jetifier/bin/jetify', { cwd: projectPath });
  console.timeEnd('Jetified in');
}

applyExtensionPatches();
applyPlatformPatches();
jetify();
