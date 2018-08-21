const ANCHORS = {
  IOS: {
    PODFILE: {
      EXTENSION_DEPENDENCIES: '## <Extension dependencies>',
      EXTENSION_POSTINSTALL_TARGETS: '## <Extension postinstall targets>',
    },
    APP_DELEGATE: {
      IMPORT: '//NativeModuleInjectionMark-appDelegate-import',
      // eslint-disable-next-line max-len
      DID_FINISH_LAUNCHING_WITH_OPTIONS: '//NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions',
      // eslint-disable-next-line max-len
      DID_FINISH_LAUNCHING_WITH_OPTIONS_END: '//NativeModuleInjectionMark-appDelegate-applicationDidFinishLaunchingWithOptions-end',
      BODY: '//NativeModuleInjectionMark-appDelegate-body',
    },
    APP_DELEGATE_HEADER: {
      IMPORT: '//NativeModuleInjectionMark-appDelegateHeader-import',
    },
  },
  ANDROID: {
    MAIN_ACTIVITY: {
      IMPORT: '//NativeModuleInjectionMark-mainActivity-import',
      ON_CREATE: '//NativeModuleInjectionMark-mainActivity-onCreate',
      ON_ACTIVITY_RESULT: '//NativeModuleInjectionMark-mainActivity-onActivityResult',
      ON_ACTIVITY_RESULT_END: '//NativeModuleInjectionMark-mainActivity-onActivityResult-end',
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
        PLUGINS: '//NativeModuleInjectionMark-app-gradle-plugins',
        BUILD_TYPES: {
          UNSIGNED_RELEASE: '//NativeModuleInjectionMark-app-gradle-buildTypes-unsignedRelease',
          RELEASE: '//NativeModuleInjectionMark-app-gradle-buildTypes-release',
          DEBUG: '//NativeModuleInjectionMark-app-gradle-buildTypes-debug',
        },
        REACT_GRADLE: '//NativeModuleInjectionMark-app-gradle-reactGradle',
        ANDROID: '//NativeModuleInjectionMark-app-gradle-android',
        ANDROID_END: '//NativeModuleInjectionMark-app-gradle-android-end'
      },
      PROPERTIES: '#NativeModuleInjectionMark-gradle-properties',
      SETTINGS: '//NativeModuleInjectionMark-gradle-settings',
    },
    MANIFEST: {
      ROOT: '<!--//NativeModuleInjectionMark-android-manifest-root-->',
      APPLICATION: '<!--//NativeModuleInjectionMark-android-manifest-application-->',
    },
  },
};

module.exports = {
  ANCHORS,
};
