const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

// parameters adjusted by CI scripts
const ciMetroParams = require('./ci-metro-params');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  const {
    resolver: { sourceExts, assetExts },
  } = defaultConfig;

  const config = {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      /**
       * Returns a regular expression for modules that should be ignored by the
       * packager on a given platform.
       */
      blockList: exclusionList([
        /\/extensions\/.*\/app\/build(\.js|\/.*)/,
        /\/extensions\/.*\/cloud\/.*/,
        /\/extensions\/.*\/server\/.*/,
        /\/scripts\/.*/,
        /\/packages\/.*/,
      ]),
      /**
       * Which other node_modules to include besides the ones relative
       * to the project directory. This is keyed by dependency name.
       * { dependencyname: dependencydirectorypath }
       */
      extraNodeModules: {
        'shoutem-core': path.join(__dirname, 'core'),
      },
    },
    ...ciMetroParams,
  };

  return mergeConfig(defaultConfig, config);
})();
