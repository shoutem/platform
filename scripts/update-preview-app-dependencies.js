const fs = require('fs-extra');
const path = require('path');

const repos = ['builder-preview', 'disclose', 'mobilizer'];

const excludedDeps = [
  'react-native-iap',
  'react-native-iaphub',
  'react-native-marketingcloudsdk',
];

function updateBuilderPreviewDeps() {
  const successfullyUpdatedRepos = [];

  repos.forEach(repo => {
    const nativeDepsPath = path.resolve(
      path.join('.', 'nativeDependencies.json'),
    );
    const uiPackageJsonPath = path.resolve(
      path.join('..', '..', 'ui', 'package.json'),
    );
    const repoPackageJsonPath = path.resolve(
      path.join('..', '..', repo, 'package.json'),
    );

    if (!fs.existsSync(nativeDepsPath)) {
      console.error(
        "You have to generate native deps JSON first. Do 'npm run get-app-dependencies'"
          .red,
      );

      return;
    }

    if (!fs.existsSync(uiPackageJsonPath)) {
      console.error(
        `Could not find ui/package.json on expected path. Your mobile repo and ui repo have to be in the same directory for this script to work.`,
      );

      return;
    }

    if (!fs.existsSync(repoPackageJsonPath)) {
      console.error(
        `Could not find ${repo}/package.json on expected path. Your mobile repo and ${repo} repo have to be in the same directory for this script to work.`,
      );

      return;
    }

    const nativeDeps = fs.readJsonSync(nativeDepsPath);
    const uiPackageJson = fs.readJsonSync(uiPackageJsonPath);
    const repoPackageJson = fs.readJsonSync(repoPackageJsonPath);

    const uiNativeDeps = {};

    uiPackageJson.nativeDependencies.forEach(depKey => {
      nativeDeps[depKey] = uiPackageJson.dependencies[depKey];
    });

    const newPackageJson = { ...repoPackageJson };

    Object.keys(nativeDeps).forEach(depKey => {
      if (!excludedDeps.includes(depKey)) {
        newPackageJson.dependencies[depKey] = nativeDeps[depKey];
      }
    });

    fs.writeJsonSync(repoPackageJsonPath, newPackageJson, {
      spaces: 2,
    });

    successfullyUpdatedRepos.push(repo);
  });
  console.log(
    'Updated package.json in the following repositories:',
    successfullyUpdatedRepos,
  );
  console.log(
    '\nNewly added native dependencies will be at the end of the list of dependencies, make sure you move them to the correct alphabetic spot.\n\nAlso check that you remove any native dependencies that no longer need to be there.\n\nThis script just updates versions and adds new native dependencies.',
  );
}

updateBuilderPreviewDeps();
