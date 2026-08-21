/**
 * Lints extension app code.
 *
 * Usage:
 *   npm run lint                    – lint every extension's app dir
 *   npm run lint audio places      – lint only shoutem.audio and shoutem.places
 *   npm run lint shoutem.audio     – full extension names work too
 *   npm run lint audio -- --fix    – flags are passed through to eslint
 *
 * Extension names resolve to extensions/<name>/app; short names get the
 * `shoutem.` prefix. Dependency-free so it runs on un-configured checkouts.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectPath = path.resolve(__dirname, '..');
const extensionsPath = path.join(projectPath, 'extensions');

const args = process.argv.slice(2);
const flags = args.filter(arg => arg.startsWith('-'));
const names = args.filter(arg => !arg.startsWith('-'));

/**
 * Resolves a user-supplied extension name (short or full) to its app
 * directory, exiting with a helpful message when it doesn't exist.
 *
 * @param {string} name Extension name, with or without the `shoutem.` prefix.
 * @returns {string} Path to the extension's app directory, relative to root.
 */
function resolveExtensionAppDir(name) {
  const candidates = name.includes('.') ? [name] : [`shoutem.${name}`, name];
  const found = candidates.find(candidate =>
    fs.existsSync(path.join(extensionsPath, candidate, 'app')),
  );

  if (!found) {
    console.error(`Unknown extension: ${name} (tried ${candidates.join(', ')})`);
    process.exit(1);
  }

  return path.join('extensions', found, 'app');
}

let targets;
if (names.length > 0) {
  targets = names.map(resolveExtensionAppDir);
} else {
  targets = fs
    .readdirSync(extensionsPath)
    .filter(dir => fs.existsSync(path.join(extensionsPath, dir, 'app')))
    .sort()
    .map(dir => path.join('extensions', dir, 'app'));
}

const result = spawnSync(
  'npx',
  ['eslint', ...targets, '--max-warnings', '0', ...flags],
  { cwd: projectPath, stdio: 'inherit' },
);

process.exit(result.status === null ? 1 : result.status);
