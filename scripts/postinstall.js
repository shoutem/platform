const _ = require('lodash');
const Promise = require('bluebird');
const util = require('util');
const fs = require('fs-extra');
const path = require('path');
const shell = require('shelljs');
const { prependProjectPath, projectPath } = require('./helpers');

const exec = util.promisify(require('child_process').exec);

const config = fs.readJsonSync(path.resolve('config.json'));
const isWeb = config.platform === 'web';
const platformPatchesDirectoryName = isWeb ? 'patches-web' : 'patches';
const extensionPatchesDirectoryName = isWeb ? 'patch-web' : 'patch';

function execShellAsync(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, opts, (code, stdout, stderr) => {
      if (code !== 0) return reject(new Error(stderr));
      return resolve(stdout);
    });
  });
}

async function getAllPackageJsonPaths(dir, jsonPaths = []) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const packageJsonFile = _.find(files, file => file.name === 'package.json');

  if (packageJsonFile) {
    jsonPaths.push(path.resolve(path.join(dir, packageJsonFile.name)));
    return jsonPaths;
  }

  await Promise.map(files, async file => {
    if (file.isDirectory()) {
      await getAllPackageJsonPaths(path.join(dir, file.name), jsonPaths);
    }
  });

  return jsonPaths;
}

async function bunPostinstall() {
  const jsonPaths = await getAllPackageJsonPaths('./node_modules');

  await Promise.map(jsonPaths, async jsonPath => {
    const json = await fs.readJson(jsonPath);
    const postinstall = _.get(json, 'scripts.postinstall');

    if (!_.isEmpty(postinstall)) {
      const parentDir = path.dirname(jsonPath);

      try {
        const cmd = `cd ${parentDir} && bun run postinstall`;
        await execShellAsync(cmd);
      } catch (error) {
        console.log('bun postinstall error:');
        console.log(error);
      }
    }
  });
}

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
    const patchPath = `node_modules/${extensionName}/${extensionPatchesDirectoryName}`;

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

/**
 * Applies the platform-level patch-package patches (`patches` or `patches-web`,
 * depending on the configured platform). A missing patches directory is fine and
 * skipped; a patch that fails to apply aborts the install with a non-zero exit so
 * builds can't silently continue with unpatched packages.
 */
async function applyPlatformPatches() {
  const patchesDir = path.join(projectPath, `${platformPatchesDirectoryName}`);

  console.time('Patching platform packages');
  console.log('Checking for patch-package patches...');

  const pathExists = await fs.pathExists(patchesDir);
  if (!pathExists) {
    return;
  }

  try {
    await exec(`node node_modules/patch-package --patch-dir ${platformPatchesDirectoryName}`, {
      cwd: projectPath,
    });
  } catch (error) {
    console.error(
      `Failed to apply platform patches from ${platformPatchesDirectoryName}:`,
    );
    console.error(error.stdout || '');
    console.error(error.stderr || error);
    process.exit(1);
  }

  console.timeEnd('Patching platform packages');
}

const bunCheckCommand = 'bun -v';
const bunExists = shell.exec(bunCheckCommand).code === 0;
if (bunExists) {
  // bun doesn't execute postinstall scripts on its own so we are executing them
  // manually
  bunPostinstall();
}
applyExtensionPatches();
applyPlatformPatches();
