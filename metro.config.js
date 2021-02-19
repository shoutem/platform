const { getDefaultConfig } = require('metro-config');
const blacklist = require('metro-config/src/defaults/blacklist');
const path = require('path');

// parameters adjusted by CI scripts
const ciMetroParams = require('./ci-metro-params');

module.exports = (async () => {
  const { resolver: { sourceExts, assetExts } } = await getDefaultConfig();

  return {
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
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      /**
       * Returns a regular expression for modules that should be ignored by the
       * packager on a given platform.
       */
      blacklistRE: blacklist([
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
})();
