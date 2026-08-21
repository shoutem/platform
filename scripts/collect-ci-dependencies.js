/**
 * CI-only helper: merges the platform template's and every extension's app
 * dependencies into the root package.json so a plain `npm install` produces a
 * dependency tree equivalent to a configured app (minus extension linking).
 *
 * Used by the lint GitHub Action, which runs on an un-configured checkout
 * where the committed package.json is the slim pre-configure one — without
 * this, packages that babel.config.js needs (e.g. react-native-reanimated)
 * are missing and ESLint fails to parse every file.
 *
 * Mirrors the merge rule of scripts/get-app-dependencies.js: extensions are
 * processed in sorted order and a later dependency entry wins on conflicts.
 *
 * Intentionally dependency-free (runs before any npm install). The modified
 * package.json is a CI artifact — never commit it.
 */
const fs = require('fs');
const path = require('path');

const projectPath = path.resolve(__dirname, '..');
const packageJsonPath = path.join(projectPath, 'package.json');
const templateJsonPath = path.join(projectPath, 'package.template.json');
const extensionsPath = path.join(projectPath, 'extensions');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectCiDependencies() {
  const packageJson = readJson(packageJsonPath);
  const templateJson = readJson(templateJsonPath);

  let dependencies = { ...packageJson.dependencies, ...templateJson.dependencies };

  const extensionDirs = fs
    .readdirSync(extensionsPath)
    .filter(dir => fs.statSync(path.join(extensionsPath, dir)).isDirectory())
    .sort();

  let mergedExtensionsCount = 0;

  extensionDirs.forEach(dir => {
    const appPackageJsonPath = path.join(extensionsPath, dir, 'app', 'package.json');

    if (!fs.existsSync(appPackageJsonPath)) {
      return;
    }

    const appPackageJson = readJson(appPackageJsonPath);

    if (appPackageJson.dependencies) {
      dependencies = { ...dependencies, ...appPackageJson.dependencies };
      mergedExtensionsCount += 1;
    }
  });

  packageJson.dependencies = dependencies;
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  console.log(
    `Merged ${Object.keys(dependencies).length} dependencies into package.json ` +
      `(template + ${mergedExtensionsCount} extensions). Do not commit this file.`,
  );
}

collectCiDependencies();
