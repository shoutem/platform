#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const EXT_PATH_ROOT = path.join('..', 'extensions');

const IGNORED_EXTENSIONS = ['i18n'];

function fetchAllExtensions() {
  const listOfExtensions = fs
    .readdirSync(EXT_PATH_ROOT)
    .filter(file => fs.lstatSync(path.join(EXT_PATH_ROOT, file)).isDirectory());

  return listOfExtensions;
}

function getExtensionTranslations(extTitle) {
  if (IGNORED_EXTENSIONS.includes(extTitle)) {
    return null;
  }

  const translationPath = path.join(
    EXT_PATH_ROOT,
    `shoutem.${extTitle}`,
    'app',
    'translations',
    'en.json',
  );

  if (fs.existsSync(translationPath)) {
    return fs.readJsonSync(translationPath);
  }

  return null;
}

function generateTranslationFile() {
  let allTranslations = {};
  const extensions = fetchAllExtensions();

  extensions.forEach(extension => {
    const extTitle = extension.replace('shoutem.', '');
    const extTranslations = getExtensionTranslations(extTitle);
    const resolvedExtTranslations = extTranslations
      ? extTranslations.shoutem
      : null;

    allTranslations = {
      shoutem: {
        ...allTranslations.shoutem,
        ...resolvedExtTranslations,
      },
    };
  });

  fs.writeJsonSync('en.json', allTranslations, { spaces: 2 });
}

generateTranslationFile();
