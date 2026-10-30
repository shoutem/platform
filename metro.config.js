/**
 * * Metro configuration
 * * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// Metro 0.83 (RN 0.81) gates `metro-config` behind an `exports` map, so `src/` is no
// longer reachable - `private/*` is the supported subpath. The module is Babel-compiled,
// hence `.default`.
const exclusionList =
  require('metro-config/private/defaults/exclusionList').default;
const path = require('path');

// parameters adjusted by CI scripts
const ciMetroParams = require('./ci-metro-params');

// Packages that create React contexts or register native views and must exist
// exactly once in the bundle. Must match SINGLETON_PACKAGES in
// extensions/shoutem.theme/app/build/const.js (the web/esbuild alias). The list
// lives here as well because the platform cannot require from an extension
// that may not be installed in a given app.
const SINGLETON_PACKAGES = [
  '@shoutem/animation',
  '@shoutem/theme',
  '@shoutem/ui',
  'react-native-svg',
];
const ROOT_ORIGIN_MODULE = path.join(__dirname, 'index.js');

/**
 * Returns whether a module request targets one of the singleton packages,
 * either the package itself or any subpath inside it.
 *
 * @param {string} moduleName The bare module specifier being resolved.
 * @returns {boolean} True for a singleton package or one of its subpaths.
 */
const isSingletonRequest = (moduleName) =>
  SINGLETON_PACKAGES.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`),
  );

/**
 * Resolves singleton packages from the project root so a copy nested under an
 * extension's node_modules can never split their React contexts. Falls back to
 * normal hierarchical resolution when the root copy is missing.
 *
 * @param {Object} context Metro resolution context.
 * @param {string} moduleName The module specifier being resolved.
 * @param {string|null} platform The target platform.
 * @returns {Object} Metro resolution result.
 */
function resolveRequest(context, moduleName, platform) {
  if (isSingletonRequest(moduleName)) {
    try {
      return context.resolveRequest(
        { ...context, originModulePath: ROOT_ORIGIN_MODULE },
        moduleName,
        platform,
      );
    } catch (error) {
      // Root copy not installed - fall through to hierarchical lookup.
    }
  }

  return context.resolveRequest(context, moduleName, platform);
}

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
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
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
      resolveRequest,
    },
    // Spread at the top level: a 'resolver' key in ci-metro-params.json would
    // replace the whole block above. CI currently writes only maxWorkers.
    ...ciMetroParams,
  };

  return mergeConfig(defaultConfig, config);
})();
