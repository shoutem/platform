'use strict';

/* eslint-disable camelcase*/

const autoBind = require('auto-bind');
const fs = require('fs-extra');
const glob = require('glob');
const Jimp = require('jimp');
const _ = require('lodash');
const path = require('path');
const plist = require('plist');
const request = require('request');
const xcode = require('xcode');

const androidBinarySettings = require('../configs/androidBinarySettings');
const iosBinarySettings = require('../configs/iosBinarySettings');
const findFileOnPath = require('../helpers/find-file-on-path');
const getXcodeProjectPath = require('../helpers/get-xcode-project-path');
const getErrorMessageFromResponse = require('../helpers/get-error-message-from-response');
const updateAndroidPackageName = require('../helpers/update-android-package-name');
const rootProjectDir = require('../helpers/get-project-path');

const binarySettings = {
  ios: iosBinarySettings,
  android: androidBinarySettings,
};

const XCSCHEME_PATH = 'ios/ShoutemApp.xcodeproj/xcshareddata/xcschemes';

function pathExists(filePath) {
  return !_.isEmpty(glob.sync(filePath));
}

function renamePath(oldPath, newPath) {
  if (!pathExists(oldPath)) {
    return Promise.resolve();
  }

  return fs.rename(oldPath, newPath);
}

function downloadImage(imageUrl, savePath) {
  const assetsDir = path.resolve(rootProjectDir, 'assets');
  fs.ensureDirSync(assetsDir);

  return new Promise((resolve, reject) => {
    request(imageUrl)
      .pipe(fs.createWriteStream(savePath))
      .on('error', () => reject())
      .on('finish', () => resolve(savePath));
  });
}

function parsePlist(plistPath) {
  const plistContent = fs.readFileSync(plistPath, 'utf8');

  let plistResult = {};
  try {
    plistResult = plist.parse(plistContent);
  } catch (e) {
    console.error('Unable to parse plist', plistPath);
  }

  return plistResult;
}

/**
 * Downloads image to downloadPath and saves resized images
 * to savePath defined in resizeConfig.
 * @param {string} imageUrl - URL of the image to be downloaded
 * @param {string} downloadPath - Path where original image would be located after download
 * @param {Object} resizeConfig - Object with definition of resulting images
 * @param {Array} resizeConfig.images - Array of image object where image is defined by
 * object: { savePath: {string}, width: {number}, height: {number} }
 * @returns {*|Promise.<TResult>|Promise<T>}
 */
function downloadAndResizeImage(
  imageUrl,
  downloadPath,
  resizeConfig,
  production,
) {
  return downloadImage(imageUrl, downloadPath, resizeConfig).then(imagePath => {
    const resizingPromises = _.map(
      resizeConfig.images,
      image =>
        new Promise((resolve, reject) => {
          Jimp.read(imagePath)
            .then(imageFile => {
              if (_.endsWith(image.savePath, 'marketing.png')) {
                imageFile
                  .colorType(2)
                  .cover(image.width, image.height)
                  .write(image.savePath);
              } else {
                imageFile
                  .rgba(true)
                  .cover(image.width, image.height)
                  .write(image.savePath);
              }
            })
            .then(() => resolve())
            .catch(error => {
              if (production) {
                return reject(error);
              }

              return resolve();
            });
        }),
    );

    return Promise.all(resizingPromises);
  });
}

class AppBinaryConfigurator {
  constructor(config) {
    autoBind(this);

    this.config = _.assign({}, config);
  }

  getServerApiHost() {
    if (!this.config.serverApiEndpoint) {
      process.exitCode = 1;
      throw new Error('serverApiEndpoint is not set in build config.');
    }

    return this.config.serverApiEndpoint;
  }

  getLegacyApiHost() {
    if (!this.config.legacyApiEndpoint) {
      process.exitCode = 1;
      throw new Error('legacyApiEndpoint is not set in build config.');
    }

    return this.config.legacyApiEndpoint;
  }

  getPublishSettings() {
    const { appId, authorization } = this.config;

    const serverApiHost = this.getServerApiHost();
    const serverApiPath = `/v1/apps/${appId}/publish-settings`;

    const requestArgs = {
      url: `http://${serverApiHost}${serverApiPath}`,
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${authorization}`,
      },
    };

    return new Promise((resolve, reject) => {
      request
        .get(requestArgs, (err, response, body) => {
          if (response.statusCode === 200) {
            this.publishingSettings = JSON.parse(body).data.attributes;
            resolve();
          } else {
            const errorMessage = getErrorMessageFromResponse(response);
            /* eslint-disable max-len */
            reject(
              `Publishing settings download failed with error: ${response.statusCode} ${errorMessage}`
                .bold.red,
            );
            /* eslint-enable max-len */
          }
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

  getPublishingProperties() {
    const { appId, authorization } = this.config;

    const legacyApiHost = this.getLegacyApiHost();
    const legacyApiPath = `/api/applications/publishing_properties.json?nid=${appId}`;

    const requestArgs = {
      url: `http://${legacyApiHost}${legacyApiPath}`,
      headers: {
        Authorization: `Bearer ${authorization}`,
      },
    };

    return new Promise((resolve, reject) => {
      request
        .get(requestArgs, (err, response, body) => {
          if (response.statusCode === 200) {
            this.publishingProperties = JSON.parse(body);
            resolve();
          } else {
            const errorMessage = getErrorMessageFromResponse(response);
            /* eslint-disable max-len */
            reject(
              `Publishing properties download failed with error: ${response.statusCode} ${errorMessage}`
                .bold.red,
            );
            /* eslint-enable max-len */
          }
        })
        .on('error', err => {
          reject(err);
        });
    });
  }

  getLaunchScreenUrl() {
    // Uploading a launch image in builder only sets this image, so we are using
    // it for both platforms
    return this.publishingProperties.iphone_launch_image_portrait;
  }

  getIPadLaunchScreenUrl() {
    return this.publishingProperties.splash_screen_tablet_url;
  }

  getAndroidAppIconUrl() {
    return this.publishingProperties.android_application_icon;
  }

  getIosAppIconUrl() {
    return this.publishingProperties.iphone_application_icon_hd_ios7;
  }

  shouldUseUniversalBuild() {
    return this.publishingSettings.ios.useUniversalBuild;
  }

  configureLaunchScreen(settings, platform) {
    console.log(`Configuring ${`${platform}`.bold} launch screen...`);

    const launchScreen = this.getLaunchScreenUrl();
    const resizeConfig = settings.launchScreen;
    const production = this.config.production;
    const launchScreenPath = './assets/launchScreen.png';

    return downloadAndResizeImage(
      launchScreen,
      launchScreenPath,
      resizeConfig,
      production,
    );
  }

  configureIPadLaunchScreen(settings, platform) {
    if (platform !== 'ios') {
      return null;
    }

    console.log(`Configuring ${'iPad'.bold} launch screen...`);

    // We use the iPhone launch screen if no iPad launch screen is provided
    const iPadLaunchScreen =
      this.getIPadLaunchScreenUrl() || this.getLaunchScreenUrl();
    const resizeConfig = settings.iPadLaunchScreen;
    const production = this.config.production;
    const iPadLaunchScreenPath = './assets/iPadLaunchScreen.png';

    return downloadAndResizeImage(
      iPadLaunchScreen,
      iPadLaunchScreenPath,
      resizeConfig,
      production,
    );
  }

  configureAppIcon(settings, platform) {
    console.log(`Configuring ${`${platform}`.bold} app icons...`);

    const resizeConfig = settings.appIcon;
    const production = this.config.production;

    let imagePath;
    let appIcon;
    if (platform === 'ios') {
      imagePath = './assets/appIcon.png';
      appIcon = this.getIosAppIconUrl();
    } else {
      imagePath = './assets/androidAppIcon.png';
      appIcon = this.getAndroidAppIconUrl();
    }

    return downloadAndResizeImage(appIcon, imagePath, resizeConfig, production);
  }

  getBinaryVersionName() {
    // We fallback to default one so CLI doesn't have to handle version
    return this.config.binaryVersionName || '5.0.0';
  }

  getBinaryVersionCode() {
    // We fallback to default one so CLI doesn't have to handle version
    return this.config.binaryVersionCode || 1;
  }

  getProjectName() {
    return this.projectName || 'ShoutemApp';
  }

  setProjectName(publishingProperties) {
    const appName = publishingProperties.iphone_name;
    const appId = publishingProperties.network_id;

    const resolvedAppName = this.shouldUseFallbackName(appName)
      ? `App${appId}`
      : _.upperFirst(_.camelCase(appName));

    this.projectName = resolvedAppName;
  }

  configureAppInfoIOS() {
    console.log(`Configuring ${'Info.plist'.bold}...`);

    const { config, publishingProperties } = this;
    const { bundleIdPrefix, iosBundleId, production } = config;
    const {
      iphone_bundle_id,
      iphone_name,
      primary_category_name,
    } = publishingProperties;

    const infoPlistPath = findFileOnPath('Info.plist', 'ios');
    const infoPlistFile = fs.readFileSync(infoPlistPath, 'utf8');
    let infoPlist = plist.parse(infoPlistFile);

    const extensionInfoPlistFiles = glob.sync(
      './extensions/?(**)/app/ios/Info.plist',
    );

    // We merge all Info.plist files from extensions with the platform one
    // If the value of the key is an array it will concatenate both arrays
    infoPlist = _.reduce(
      extensionInfoPlistFiles,
      (finalPlist, extPlistPath) => {
        const extPlist = parsePlist(extPlistPath);

        return _.mergeWith(finalPlist, extPlist, (objValue, srcValue) => {
          if (_.isArray(objValue)) {
            return _.uniq(objValue.concat(srcValue));
          }

          return srcValue;
        });
      },
      infoPlist,
    );

    // We use this prefix for building apps with wildcard application identifier
    const bundlePrefix = bundleIdPrefix ? `${bundleIdPrefix}.` : '';
    let bundleId;

    if (iosBundleId) {
      bundleId = iosBundleId;
    } else if (production) {
      bundleId = iphone_bundle_id;
    } else {
      bundleId = 'com.shoutem.ShoutemApp';
    }

    infoPlist.CFBundleName = iphone_name;
    infoPlist.CFBundleDisplayName = iphone_name;
    infoPlist.CFBundleIdentifier = `${bundlePrefix}${bundleId}`;
    infoPlist.CFBundleShortVersionString = this.getBinaryVersionName();
    infoPlist.LSApplicationCategoryType = primary_category_name;

    if (this.shouldUseUniversalBuild()) {
      console.log(`Configuring ${'xcodeproj'.bold}...`);
      const xcodeProjectPath = getXcodeProjectPath();
      const xcodeProject = xcode.project(xcodeProjectPath);

      xcodeProject.parse(() => {
        xcodeProject.addBuildProperty(
          'TARGETED_DEVICE_FAMILY',
          '"1,2"',
          'Debug',
        );
        xcodeProject.addBuildProperty(
          'TARGETED_DEVICE_FAMILY',
          '"1,2"',
          'Release',
        );

        fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync());
      });
    }

    fs.writeFileSync(infoPlistPath, plist.build(infoPlist));
  }

  configureAppInfoAndroid() {
    console.log(`Configuring ${'build.gradle'.bold}...`);

    const { config, publishingProperties } = this;
    const { androidApplicationId, production } = config;
    const { android_market_package_name, android_name } = publishingProperties;

    let applicationId;

    if (androidApplicationId) {
      applicationId = androidApplicationId;
    } else if (production) {
      applicationId = android_market_package_name;
      updateAndroidPackageName('com.shoutemapp', android_market_package_name);
    } else {
      applicationId = 'com.shoutemapp';
    }

    const buildGradlePath = './android/app/build.gradle';
    const buildGradle = fs.readFileSync(buildGradlePath, 'utf8');
    const newBuildGradle = buildGradle
      .replace(/\sapplicationId\s.*/g, ` applicationId '${applicationId}'`)
      .replace(
        /\sversionCode\s.*/g,
        ` versionCode ${this.getBinaryVersionCode()}`,
      )
      .replace(
        /\sversionName\s.*/g,
        ` versionName '${this.getBinaryVersionName()}'`,
      )
      .replace(/ShoutemApplicationName/g, android_name);

    fs.writeFileSync(buildGradlePath, newBuildGradle);
  }

  configureAppInfo(settings, platform) {
    if (platform === 'ios') {
      this.configureAppInfoIOS();
    } else if (platform === 'android') {
      this.configureAppInfoAndroid();
    }

    return Promise.resolve();
  }

  runForAllPlatforms(configureFunction) {
    return Promise.all(
      _.map(binarySettings, (settings, platform) => {
        if (_.isFunction(configureFunction)) {
          configureFunction(_.result(binarySettings, platform), platform);
        }
      }),
    );
  }

  configureApp() {
    return this.getPublishingProperties()
      .then(() => this.getPublishSettings())
      .then(() => this.runForAllPlatforms(this.configureLaunchScreen))
      .then(() => this.runForAllPlatforms(this.configureIPadLaunchScreen))
      .then(() => this.runForAllPlatforms(this.configureAppIcon))
      .then(() => this.runForAllPlatforms(this.configureAppInfo));
  }

  renameIOSScheme() {
    const oldScheme = path.join(XCSCHEME_PATH, 'ShoutemApp.xcscheme');
    const newScheme = path.join(
      XCSCHEME_PATH,
      `${this.getProjectName()}.xcscheme`,
    );

    return renamePath(oldScheme, newScheme);
  }

  renameIOSEntitlements() {
    const oldEntitlements = 'ios/ShoutemApp/ShoutemApp.entitlements';
    const newEntitlements = `ios/ShoutemApp/${this.getProjectName()}.entitlements`;

    return renamePath(oldEntitlements, newEntitlements);
  }

  updateProjectName(fileContent) {
    return fileContent.replace(/ShoutemApp/g, this.getProjectName());
  }

  renameProjectDir() {
    const oldProjectDir = 'ios/ShoutemApp';
    const newProjectDir = `ios/${this.getProjectName()}`;

    return renamePath(oldProjectDir, newProjectDir);
  }

  updateProjectPaths() {
    const projectPath = findFileOnPath('project.pbxproj', 'ios');
    const xcodeProject = fs.readFileSync(projectPath, 'utf8');
    const newXcodeProject = this.updateProjectName(xcodeProject);

    return fs.writeFile(projectPath, newXcodeProject);
  }

  updateSchemePaths() {
    const schemePath = findFileOnPath(
      'xcshareddata/xcschemes/*.xcscheme',
      'ios',
    );
    const xcodeScheme = fs.readFileSync(schemePath, 'utf8');
    const newXcodeScheme = this.updateProjectName(xcodeScheme);

    return fs.writeFile(schemePath, newXcodeScheme);
  }

  renameXcodeProject() {
    const workspacePath = findFileOnPath('contents.xcworkspacedata', 'ios');
    const xcodeWorkspace = fs.readFileSync(workspacePath, 'utf8');
    const newXcodeWorkspace = this.updateProjectName(xcodeWorkspace);
    const oldProjectPath = 'ios/ShoutemApp.xcodeproj';
    const newProjectPath = `ios/${this.getProjectName()}.xcodeproj`;

    return renamePath(oldProjectPath, newProjectPath).then(() =>
      fs.writeFile(workspacePath, newXcodeWorkspace),
    );
  }

  renameXCWorkspace() {
    const oldWorkspace = 'ios/ShoutemApp.xcworkspace';
    const newWorkspace = `ios/${this.getProjectName()}.xcworkspace`;

    return renamePath(oldWorkspace, newWorkspace);
  }

  renameRCTRootView() {
    const AppDelegatePath = findFileOnPath('AppDelegate.mm', 'ios');
    const MainActivityPath =
      'android/app/src/main/java/com/shoutemapp/MainActivity.java';

    if (!AppDelegatePath) {
      return Promise.resolve();
    }

    const AppDelegate = fs.readFileSync(AppDelegatePath, 'utf8');
    const MainActivity = fs.readFileSync(MainActivityPath, 'utf8');
    const indexJsPath = 'index.js';
    const indexJs = fs.readFileSync(indexJsPath, 'utf8');

    return fs
      .writeFile(AppDelegatePath, this.updateProjectName(AppDelegate))
      .then(() =>
        fs.writeFile(MainActivityPath, this.updateProjectName(MainActivity)),
      )
      .then(() => fs.writeFile(indexJsPath, this.updateProjectName(indexJs)));
  }

  updatePodfile() {
    const podfilePath = 'ios/Podfile';
    const podfile = fs.readFileSync(podfilePath, 'utf8');

    return fs.writeFile(podfilePath, this.updateProjectName(podfile));
  }

  shouldUseFallbackName(appName) {
    // nonAsciiReg matches any non-ASCII characters
    /* eslint-disable no-control-regex */
    const integerReg = /^\d+$/;
    const floatReg = /^\d+\.\d+$/;
    const nonAsciiReg = /[^\u0000-\u007f]/;
    /* eslint-disable no-control-regex */

    if (integerReg.test(appName) || floatReg.test(appName)) {
      console.log(
        "App name is just a number, using a generic name for file names instead.\nYour app name hasn't changed, only the file names have.",
      );

      return true;
    }

    if (nonAsciiReg.test(appName)) {
      console.log(
        "App name contains non-ASCII characters, using a generic name for file names instead.\nYour app name hasn't changed, only the file names have.",
      );

      return true;
    }

    return false;
  }

  customizeProject() {
    if (this.config.skipIOSProjectCustomization) {
      return Promise.resolve();
    }

    return this.getPublishingProperties()
      .then(() => this.setProjectName(this.publishingProperties))
      .then(() => this.renameIOSScheme())
      .then(() => this.renameIOSEntitlements())
      .then(() => this.renameRCTRootView())
      .then(() => this.renameProjectDir())
      .then(() => this.updateProjectPaths())
      .then(() => this.updateSchemePaths())
      .then(() => this.renameXcodeProject())
      .then(() => this.renameXCWorkspace())
      .then(() => this.updatePodfile());
  }
}

module.exports = AppBinaryConfigurator;
