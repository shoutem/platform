'use strict';

const findFileOnPath = require('../helpers/find-file-on-path');

module.exports = function() {
  const iosLaunchScreenDirectory = findFileOnPath(
    'Images.xcassets/Image.imageset/',
    'ios',
  );
  const iosAppIconDirectory = findFileOnPath(
    'Images.xcassets/AppIcon.appiconset/',
    'ios',
  );

  return {
    launchScreen: {
      images: [
        {
          savePath: `${iosLaunchScreenDirectory}background.png`,
          width: 1080,
          height: 1920,
        },
      ],
    },
    iPadLaunchScreen: {
      images: [
        {
          savePath: `${iosLaunchScreenDirectory}ipad-background.png`,
          width: 1536,
          height: 2048,
        },
      ],
    },
    appIcon: {
      images: [
        {
          savePath: `${iosAppIconDirectory}ipad-icon-1.png`,
          width: 20,
          height: 20,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-2.png`,
          width: 40,
          height: 40,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-3.png`,
          width: 29,
          height: 29,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-4.png`,
          width: 58,
          height: 58,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-5.png`,
          width: 40,
          height: 40,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-6.png`,
          width: 80,
          height: 80,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-7.png`,
          width: 76,
          height: 76,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-8.png`,
          width: 152,
          height: 152,
        },
        {
          savePath: `${iosAppIconDirectory}ipad-icon-9.png`,
          width: 167,
          height: 167,
        },
        {
          savePath: `${iosAppIconDirectory}icon-1.png`,
          width: 40,
          height: 40,
        },
        {
          savePath: `${iosAppIconDirectory}icon-2.png`,
          width: 60,
          height: 60,
        },
        {
          savePath: `${iosAppIconDirectory}icon-3.png`,
          width: 58,
          height: 58,
        },
        {
          savePath: `${iosAppIconDirectory}icon-4.png`,
          width: 87,
          height: 87,
        },
        {
          savePath: `${iosAppIconDirectory}icon-5.png`,
          width: 80,
          height: 80,
        },
        {
          savePath: `${iosAppIconDirectory}icon-6.png`,
          width: 120,
          height: 120,
        },
        {
          savePath: `${iosAppIconDirectory}icon-7.png`,
          width: 120,
          height: 120,
        },
        {
          savePath: `${iosAppIconDirectory}icon-8.png`,
          width: 180,
          height: 180,
        },
        {
          savePath: `${iosAppIconDirectory}marketing.png`,
          width: 1024,
          height: 1024,
        },
      ],
    },
  };
};
