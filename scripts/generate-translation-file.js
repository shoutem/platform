#!/usr/bin/env node

const fs = require('fs-extra');

const EXT_PATH_ROOT = '../extensions/';
const PLATFORM_PATH = '../platform/platform.json';
const TRANSLATION_PATH = '/app/translations/en.json';

// returns array of extensions from platform.json dependencies
function fetchPlatformExtensions() {
  const platformJson = fs.readJsonSync(PLATFORM_PATH);

  return Object.keys(platformJson.dependencies);
}

function getExtensionTranslations(extTitle) {
  const translationPath =
    `${EXT_PATH_ROOT}/shoutem.${extTitle}${TRANSLATION_PATH}`;

  if (fs.existsSync(translationPath)) {
    return fs.readJsonSync(translationPath);
  }

  return null;
}

function generateTranslationFile() {
  let allTranslations = {};
  const extensions = fetchPlatformExtensions();

  extensions.forEach(extension => {
    const extTitle = extension.replace('shoutem.', '');
    const extTranslations = getExtensionTranslations(extTitle);
    const resolvedExtTranslations = extTranslations ? extTranslations.shoutem : null;

    allTranslations = {
      shoutem: {
        ...allTranslations.shoutem,
        ...resolvedExtTranslations,
      }
    }
  });

  fs.writeJsonSync('en.json', allTranslations, { spaces: 2 });
}

generateTranslationFile();
