'use strict';

/* eslint-disable camelcase */

const autoBind = require('auto-bind');
const { execSync } = require('child_process');
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
const { projectPath } = require('../helpers');

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

  configureBootsplash() {
    // Web builds don't install native dependencies, so the bootsplash CLI
    // binary isn't present and there are no native splash assets to generate.
    if (this.config.platform === 'web') {
      console.log('Skipping bootsplash configuration: web build.');
      return Promise.resolve();
    }

    const launchScreen = this.getLaunchScreenUrl();
    const iPadLaunchScreen = this.getIPadLaunchScreenUrl();

    if (!launchScreen) {
      console.log('Skipping bootsplash configuration: no launch screen URL.');
      return Promise.resolve();
    }

    console.log(`Configuring ${'bootsplash'.bold} (iOS + Android)...`);

    const logoPath = path.resolve(rootProjectDir, 'assets/bootsplashLogo.png');
    const iPadLogoPath = path.resolve(
      rootProjectDir,
      'assets/bootsplashLogoIpad.png',
    );
    const backgroundColor = '#ffffff';

    return downloadImage(launchScreen, logoPath)
      .then(() => Jimp.read(logoPath))
      .then(image => image.writeAsync(logoPath))
      .then(() => Jimp.read(logoPath))
      .then(image => {
        // Android: resize the source into per-density variants
        // (drawable, drawable-ldpi … drawable-xxxhdpi). At runtime these
        // are consumed by R.layout.launch_screen's <ImageView
        // src="@drawable/splash" scaleType="centerCrop"/>, which the
        // SplashOverlay native module inflates and overlays onto the
        // activity from MainActivity.onCreate.
        const resizes = androidBinarySettings.launchScreen.images.map(target =>
          image
            .clone()
            .rgba(true)
            .cover(target.width, target.height)
            .writeAsync(target.savePath),
        );
        return Promise.all(resizes);
      })
      .then(() => {
        // iPad-specific splash: when the app owner uploaded a separate tablet
        // image, download and resize to iPad portrait native @2x (1536×2048)
        // so we can inject it as an idiom="ipad" variant into the bootsplash
        // imageset. Without this, iPad falls back to the iPhone image via
        // scaleAspectFill, cropping app-owner art.
        if (!iPadLaunchScreen) {
          return null;
        }

        return downloadImage(iPadLaunchScreen, iPadLogoPath)
          .then(() => Jimp.read(iPadLogoPath))
          .then(image =>
            image.rgba(true).cover(1536, 2048).writeAsync(iPadLogoPath),
          );
      })
      .then(() => {
        const bootsplashCli = path.resolve(
          rootProjectDir,
          'node_modules/.bin/react-native-bootsplash',
        );

        // iOS: bootsplash CLI generates the image asset and storyboard; we
        // override the storyboard to display it edge-to-edge (scaleAspectFill).
        execSync(
          `${bootsplashCli} generate ${logoPath} --background "${backgroundColor}" --logo-width 1200 --platforms ios`,
          { stdio: 'inherit', cwd: rootProjectDir },
        );

        this.writeFullScreenIosStoryboard();

        if (iPadLaunchScreen) {
          this.addIPadVariantToBootsplashImageset(iPadLogoPath);
        }
      });
  }

  // Overwrites bootsplash's generated BootSplash.storyboard with a custom
  // one that pins the imageView to all four edges with scaleAspectFill (the
  // CLI default is scaleAspectFit, which inset-letterboxes the logo on a
  // background color — not what app owners upload).
  //
  // COUPLING WARNING: this discovers bootsplash's imageset by glob because
  // bootsplash 6.x suffixes a content hash to the imageset name (e.g.
  // BootSplashLogo-c86379.imageset). If you bump react-native-bootsplash,
  // re-verify (1) the imageset is still named BootSplashLogo*, (2) the
  // storyboard XML schema is still compatible, and (3) the Contents.json
  // entries we inject for the iPad variant in addIPadVariantToBootsplashImageset
  // still match bootsplash's format. The override is defensive — it skips
  // silently on mismatch — so configure won't crash, but you'll get a
  // centered logo instead of full-bleed art.
  writeFullScreenIosStoryboard() {
    const storyboardPath = findFileOnPath(
      'BootSplash.storyboard',
      path.resolve(rootProjectDir, 'ios'),
    );

    if (!storyboardPath) {
      console.log('[bootsplash] BootSplash.storyboard not found, skipping iOS full-screen override.');
      return;
    }

    const imagesetMatches = glob.sync(
      `${path.resolve(rootProjectDir, 'ios')}/**/Images.xcassets/BootSplashLogo*.imageset`,
      { ignore: ['**/Pods/**'] },
    );

    if (_.isEmpty(imagesetMatches)) {
      console.log('[bootsplash] BootSplashLogo imageset not found, skipping iOS full-screen override.');
      return;
    }

    const imageName = path.basename(imagesetMatches[0], '.imageset');

    const storyboardXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="22155" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="NO" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina6_12" orientation="portrait" appearance="light"/>
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="22131"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFill" image="${imageName}" translatesAutoresizingMaskIntoConstraints="NO" id="logo"/>
                        </subviews>
                        <color key="backgroundColor" red="1" green="1" blue="1" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                        <constraints>
                            <constraint firstItem="logo" firstAttribute="top" secondItem="Ze5-6b-2t3" secondAttribute="top" id="top"/>
                            <constraint firstItem="logo" firstAttribute="bottom" secondItem="Ze5-6b-2t3" secondAttribute="bottom" id="bottom"/>
                            <constraint firstItem="logo" firstAttribute="leading" secondItem="Ze5-6b-2t3" secondAttribute="leading" id="leading"/>
                            <constraint firstItem="logo" firstAttribute="trailing" secondItem="Ze5-6b-2t3" secondAttribute="trailing" id="trailing"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" sceneMemberID="firstResponder"/>
            </objects>
        </scene>
    </scenes>
    <resources>
        <image name="${imageName}" width="1024" height="1024"/>
    </resources>
</document>
`;

    fs.writeFileSync(storyboardPath, storyboardXml);
    console.log(`[bootsplash] iOS storyboard overridden for full-screen splash (image: ${imageName}).`);
  }

  addIPadVariantToBootsplashImageset(iPadLogoPath) {
    // Adds an idiom="ipad" entry to the bootsplash-generated imageset so iOS
    // automatically picks the app owner's iPad splash on tablet devices.
    // Restores parity with the pre-bootsplash flow that wrote a separate
    // ipad-background.png alongside the iPhone image in Image.imageset.
    const imagesetMatches = glob.sync(
      `${path.resolve(rootProjectDir, 'ios')}/**/Images.xcassets/BootSplashLogo*.imageset`,
      { ignore: ['**/Pods/**'] },
    );

    if (_.isEmpty(imagesetMatches)) {
      console.log('[bootsplash] BootSplashLogo imageset not found, skipping iPad variant injection.');
      return;
    }

    const imagesetDir = imagesetMatches[0];
    const contentsJsonPath = path.join(imagesetDir, 'Contents.json');

    if (!fs.existsSync(contentsJsonPath)) {
      console.log('[bootsplash] BootSplashLogo imageset Contents.json not found, skipping iPad variant injection.');
      return;
    }

    const iPadFilename = 'bootsplash_logo_ipad.png';
    fs.copyFileSync(iPadLogoPath, path.join(imagesetDir, iPadFilename));

    const contents = JSON.parse(fs.readFileSync(contentsJsonPath, 'utf8'));
    contents.images = (contents.images || []).filter(img => img.idiom !== 'ipad');
    contents.images.push({
      idiom: 'ipad',
      filename: iPadFilename,
      scale: '2x',
    });
    fs.writeFileSync(contentsJsonPath, JSON.stringify(contents, null, 2));

    console.log('[bootsplash] iPad variant injected into BootSplashLogo imageset.');
  }

  configureAppIcon(settings, platform) {
    if (platform === 'web') {
      console.log(`Skipping ${`${platform}`.bold} app icon configuration ...`);
      return Promise.resolve();
    }

    console.log(`Configuring ${`${platform}`.bold} app icons...`);

    const resizeConfig = settings.appIcon;
    const { production } = this.config;

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
    const { bundleIdPrefix, iosBundleId, production, installedExtensions } = config;
    const {
      iphone_bundle_id,
      iphone_name,
      primary_category_name,
    } = publishingProperties;

    const infoPlistPath = findFileOnPath(
      'Info.plist',
      `ios/${this.getProjectName()}`,
    );
    const infoPlistFile = fs.readFileSync(infoPlistPath, 'utf8');
    let infoPlist = plist.parse(infoPlistFile);

    const includedExtensions = _.map(installedExtensions, extension => extension.id);

    infoPlist = includedExtensions.reduce((finalPlist, extensionKey) => {
      const extPlistPath = path.join(
        projectPath,
        './extensions',
        extensionKey,
        'app',
        'ios',
        'Info.plist'
      );
    
      // Check if the Info.plist file exists
      if (fs.existsSync(extPlistPath)) {
        // Parse the plist file if it exists
        const extPlist = parsePlist(extPlistPath);
    
        // Merge with the final plist
        return _.mergeWith(finalPlist, extPlist, (objValue, srcValue) => {
          if (_.isArray(objValue)) {
            return _.uniq(objValue.concat(srcValue));
          }
    
          return srcValue;
        });
      }
    
      return finalPlist;
    }, infoPlist);

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
      const xcodeProjectPath = getXcodeProjectPath({
        cwd: `${projectPath}/ios/${this.getProjectName()}.xcodeproj`,
      });
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
      .then(() => this.configureBootsplash())
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
    const AppDelegatePath = findFileOnPath('AppDelegate.swift', 'ios');
    const MainActivityPath =
      'android/app/src/main/java/com/shoutemapp/MainActivity.kt';

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
