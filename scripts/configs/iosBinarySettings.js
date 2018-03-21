'use strict';

const findFileOnPath = require('../helpers/find-file-on-path');

module.exports = function () {
  const iosLaunchScreenDirectory = findFileOnPath('Images.xcassets/Image.imageset/', 'ios');
  const iosAppIconDirectory = findFileOnPath('Images.xcassets/AppIcon.appiconset/', 'ios');

  return {
    launchScreen: {
      images: [{
        savePath: `${iosLaunchScreenDirectory}background.png`,
        width: 1080,
        height: 1920,
      }],
    },
    appIcon: {
      images: [{
        savePath: `${iosAppIconDirectory}icon-1.png`,
        width: 40,
        height: 40,
      }, {
        savePath: `${iosAppIconDirectory}icon-2.png`,
        width: 60,
        height: 60,
      }, {
        savePath: `${iosAppIconDirectory}icon-3.png`,
        width: 58,
        height: 58,
      }, {
        savePath: `${iosAppIconDirectory}icon-4.png`,
        width: 87,
        height: 87,
      }, {
        savePath: `${iosAppIconDirectory}icon-5.png`,
        width: 80,
        height: 80,
      }, {
        savePath: `${iosAppIconDirectory}icon-6.png`,
        width: 120,
        height: 120,
      }, {
        savePath: `${iosAppIconDirectory}icon-7.png`,
        width: 120,
        height: 120,
      }, {
        savePath: `${iosAppIconDirectory}icon-8.png`,
        width: 180,
        height: 180,
      }, {
        savePath: `${iosAppIconDirectory}marketing.png`,
        width: 1024,
        height: 1024,
      },
    ],
    },
  };
};
