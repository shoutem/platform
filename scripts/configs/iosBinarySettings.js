'use strict';

const iosLaunchScreenDirectory = './ios/ShoutemApp/Images.xcassets/LaunchImage.launchimage/';
const iosAppIconDirectory = './ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/';

module.exports = {
  launchScreen: {
    images: [{
      savePath: `${iosLaunchScreenDirectory}icon-1.png`,
      width: 320,
      height: 480,
    }, {
      savePath: `${iosLaunchScreenDirectory}icon-2.png`,
      width: 640,
      height: 960,
    }, {
      savePath: `${iosLaunchScreenDirectory}icon-3.png`,
      width: 640,
      height: 1136,
    }, {
      savePath: `${iosLaunchScreenDirectory}icon-4.png`,
      width: 1242,
      height: 2208,
    }, {
      savePath: `${iosLaunchScreenDirectory}icon-5.png`,
      width: 750,
      height: 1334,
    }, {
      savePath: `${iosLaunchScreenDirectory}icon-7.png`,
      width: 640,
      height: 960,
    }, {
      savePath: `${iosLaunchScreenDirectory}icon-8.png`,
      width: 640,
      height: 1136,
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
    }],
  },
};
