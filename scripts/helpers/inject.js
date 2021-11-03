const fs = require('fs');
const _ = require('lodash');

const { shortPath } = require('./path');

function isInjected(anchor, content, fileContent) {
  const contentBelowAnchor = _.get(fileContent.split(anchor), '[1]', null);
  return contentBelowAnchor.indexOf(content) > 0;
}

/**
 * Injects selected file with provided content, uses anchor mark
 * to specify where content is appended.
 *
 * @param {String} filePath Path to file that should be injected
 * @param {String} anchor Anchor at which new content is appended
 * @param {String} content Content to inject in file
 */
function inject(filePath, anchor, content) {
  if (!filePath) {
    throw new Error('Please provide a valid file path');
  }
  if (!anchor) {
    throw new Error(
      'Please provide a valid anchor. Check @shoutem/build-tools/const',
    );
  }
  if (!content) {
    throw new Error('Please provide a valid content to inject');
  }

  const filePathShort = shortPath(filePath);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  const shortContent = `${content.substring(0, 20).trim()}...`;
  const alreadyInjected = isInjected(anchor, content, fileContents);
  if (alreadyInjected) {
    console.log(`Injecting "${filePathShort}": "${shortContent}" - [Skipped].`);
    return;
  }

  const anchorRegex = new RegExp(`^(.*)${anchor}$`, 'gm');
  const newFileContents = fileContents.replace(
    anchorRegex,
    `$1${anchor}\n$1${content}`,
  );
  fs.writeFileSync(filePath, newFileContents);
  console.log(`Injecting "${filePathShort}": "${shortContent}" - [OK].`);
}

module.exports = inject;
