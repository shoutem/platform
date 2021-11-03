const fs = require('fs');

const { shortPath } = require('./path');

function formatLogMessage(filePath, oldContent, newContent) {
  const shortOldContent = `${oldContent.substring(0, 20).trim()}...`;
  const shortNewContent = `${newContent.substring(0, 20).trim()}...`;
  const shortFilePath = shortPath(filePath);

  return `Replace "${shortFilePath}": "${shortOldContent}" > "${shortNewContent}"`;
}

/**
 * Replace selected file's contents with provided content.
 *
 * @param {String} filePath Path to file
 * @param {String} oldContent Content to replace in file
 * @param {String} newContent Content to be replaced in file
 */
function replace(filePath, oldContent, newContent) {
  if (!filePath) {
    throw new Error('Please provide a valid file path');
  }
  if (!oldContent) {
    throw new Error('Please provide a valid content to replace.');
  }
  if (!newContent) {
    throw new Error('Please provide a valid content to replace with');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  const message = formatLogMessage(filePath, oldContent, newContent);
  const alreadyReplaced = fileContents.indexOf(newContent) > 0;
  if (alreadyReplaced) {
    console.log(`${message} - [Skipped].`);
    return;
  }

  const saniteizedOldContent = oldContent.replace(
    /[-[\]{}()*+?.,\\^$|#\s]/g,
    '\\$&',
  );
  const anchorRegex = new RegExp(`^(.*)${saniteizedOldContent}$`, 'gm');
  const newFileContents = fileContents.replace(anchorRegex, `$1${newContent}`);

  fs.writeFileSync(filePath, newFileContents);
  console.log(`${message}  - [OK].`);
}

module.exports = replace;
