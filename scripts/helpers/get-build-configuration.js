const path = require('path');
const fs = require('fs-extra');
const buildDir = path.resolve(__dirname, '..', '..', 'config');
const filePath = path.join(buildDir, 'buildConfig.json');

module.exports = function getBuildConfiguration() {
  const data = fs.readJsonSync(filePath, { throws: false });

  if (data === null) {
    console.log(
      `${filePath} is an invalid path, or the file is either missing or empty.`,
    );
  }

  return data;
};
