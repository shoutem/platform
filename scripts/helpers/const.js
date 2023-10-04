const filesChangedByConfigurationScript = [
  'android/app/build.gradle',
  'android/app/src/main/AndroidManifest.xml',
  'android/app/src/main/java/com/shoutemapp/MainActivity.java',
  'android/app/src/main/java/com/shoutemapp/MainApplication.java',
  'android/app/src/main/java/com/shoutemapp/newarchitecture/MainApplicationReactNativeHost.java',
  'android/app/src/main/java/com/shoutemapp/newarchitecture/components/MainComponentsRegistry.java',
  'android/app/src/main/java/com/shoutemapp/newarchitecture/modules/MainApplicationTurboModuleManagerDelegate.java',
  'android/app/src/main/res/drawable-hdpi/splash.png',
  'android/app/src/main/res/drawable-ldpi/splash.png',
  'android/app/src/main/res/drawable-mdpi/splash.png',
  'android/app/src/main/res/drawable-xhdpi/splash.png',
  'android/app/src/main/res/drawable-xxhdpi/splash.png',
  'android/app/src/main/res/drawable-xxxhdpi/splash.png',
  'android/app/src/main/res/drawable/splash.png',
  'android/app/src/main/res/mipmap-hdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-mdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png',
  'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png',
  'android/app/src/main/res/values/strings.xml',
  'android/build.gradle',
  'android/gradle.properties',
  'android/settings.gradle',
  'extensions/shoutem.advertising/app/ios/Info.plist',
  'extensions/shoutem.audio/app/ios/Info.plist',
  'extensions/shoutem.auth/app/ios/Info.plist',
  'index.js',
  'ios/Podfile.template',
  'ios/Podfile',
  'ios/ShoutemApp.xcodeproj/project.pbxproj',
  'ios/ShoutemApp.xcodeproj/xcshareddata/xcschemes/ShoutemApp.xcscheme',
  'ios/ShoutemApp.xcworkspace/contents.xcworkspacedata',
  'ios/ShoutemApp.xcworkspace/xcshareddata/WorkspaceSettings.xcsettings',
  'ios/ShoutemApp/AppDelegate.h',
  'ios/ShoutemApp/AppDelegate.mm',
  'ios/ShoutemApp/Base.lproj/LaunchScreen.xib',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/Contents.json',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-1.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-2.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-3.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-4.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-5.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-6.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-7.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/icon-8.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-1.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-2.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-3.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-4.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-5.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-6.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-7.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-8.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/ipad-icon-9.png',
  'ios/ShoutemApp/Images.xcassets/AppIcon.appiconset/marketing.png',
  'ios/ShoutemApp/Images.xcassets/Contents.json',
  'ios/ShoutemApp/Images.xcassets/Image.imageset/Contents.json',
  'ios/ShoutemApp/Info.plist',
  'ios/ShoutemApp/ShoutemApp.entitlements',
  'ios/ShoutemApp/main.m',
  'package.json',
];

const ANCHORS = {
  IOS: {
    PODFILE: {
      ADDITIONAL_TARGET: '## <Additional target>',
      EXTENSION_DEPENDENCIES: '## <Extension dependencies>',
      EXTENSION_POSTINSTALL_TARGETS: '## <Extension postinstall targets>',
    },
    APP_DELEGATE: {
      IMPORT: '//NativeModuleInjectionMark-appDelegate-import',
      // eslint-disable-next-line max-len
      DID_FINISH_LAUNCHING_WITH_OPTIONS:
        '//NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions',
      // eslint-disable-next-line max-len
      DID_FINISH_LAUNCHING_WITH_OPTIONS_END:
        '//NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions-end',
      BODY: '//NativeModuleInjectionMark-appDelegate-body',
    },
    APP_DELEGATE_HEADER: {
      IMPORT: '//NativeModuleInjectionMark-appDelegateHeader-import',
    },
    ENTITLEMENTS: {
      ADD_ENTITLEMENTS:
        '<!-- //NativeModuleInjectionMark-entitlements-addEntitlements -->',
    },
  },
  ANDROID: {
    MAIN_ACTIVITY: {
      IMPORT: '//NativeModuleInjectionMark-mainActivity-import',
      ON_CREATE: '//NativeModuleInjectionMark-mainActivity-onCreate',
      ON_ACTIVITY_RESULT:
        '//NativeModuleInjectionMark-mainActivity-onActivityResult',
      ON_ACTIVITY_RESULT_END:
        '//NativeModuleInjectionMark-mainActivity-onActivityResult-end',
    },
    MAIN_APPLICATION: {
      IMPORT: '//NativeModuleInjectionMark-mainApplication-import',
      BODY: '//NativeModuleInjectionMark-mainApplication-body',
      GET_PACKAGES: '//NativeModuleInjectionMark-mainApplication-getPackages',
      ON_CREATE_END: '//NativeModuleInjectionMark-mainApplication-oncreate-end',
      RN_HOST_BODY: '//NativeModuleInjectionMark-mainApplication-rnhost-body',
    },
    GRADLE: {
      APP: {
        DEPENDENCIES: '//NativeModuleInjectionMark-app-gradle-dependencies',
        DEFAULT_CONFIG: '//NativeModuleInjectionMark-app-gradle-default-config',
        PLUGINS: '//NativeModuleInjectionMark-app-gradle-plugins',
        PLUGINS_END: '//NativeModuleInjectionMark-app-gradle-plugins-end',
        BUILD_TYPES: {
          UNSIGNED_RELEASE:
            '//NativeModuleInjectionMark-app-gradle-buildTypes-unsignedRelease',
          RELEASE: '//NativeModuleInjectionMark-app-gradle-buildTypes-release',
          DEBUG: '//NativeModuleInjectionMark-app-gradle-buildTypes-debug',
        },
        REACT_GRADLE: '//NativeModuleInjectionMark-app-gradle-reactGradle',
        ANDROID: '//NativeModuleInjectionMark-app-gradle-android',
        ANDROID_END: '//NativeModuleInjectionMark-app-gradle-android-end',
      },
      ROOT_GRADLE: '//NativeModuleInjectionMark-root-gradle',
      ROOT_GRADLE_ALLPROJECTS:
        '//NativeModuleInjectionMark-root-gradle-allprojects',
      ROOT_GRADLE_ALLPROJECTS_REPOSITORIES:
        '//NativeModuleInjectionMark-root-gradle-allprojects-repositories',
      ROOT_GRADLE_ALLPROJECTS_CONFIGURATIONS_ALL:
        '//NativeModuleInjectionMark-root-gradle-allprojects-configurations.all',
      ROOT_GRADLE_ALLPROJECTS_CONFIGURATIONS_ALL_RESOLUTION_STRATEGY:
        '//NativeModuleInjectionMark-root-gradle-allprojects-configurations.all-resolutionStrategy',
      PROPERTIES: '#NativeModuleInjectionMark-gradle-properties',
      CONSTANTS: '//NativeModuleInjectionMark-gradle-constants',
      SETTINGS: '//NativeModuleInjectionMark-gradle-settings',
      SETTINGS_END: '//NativeModuleInjectionMark-gradle-settings-end',
    },
    MANIFEST: {
      ROOT: '<!--//NativeModuleInjectionMark-android-manifest-root-->',
      QUERIES: '<!--//NativeModuleInjectionMark-android-manifest-queries-->',
      APPLICATION:
        '<!--//NativeModuleInjectionMark-android-manifest-application-->',
      MAIN_ACTIVITY_INTENT_FILTERS:
        '<!--//NativeModuleInjectionMark-android-manifest-main-activity-intent-filters-->',
    },
    RES: {
      VALUES: {
        STRINGS: '<!-- NativeModuleInjectionMark-android-res-values-strings -->'
      }
    }
  },
};

module.exports = {
  ANCHORS,
  filesChangedByConfigurationScript,
};
