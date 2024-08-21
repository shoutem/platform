module.exports = function babelConfig(api) {
  api.cache.forever();

  const presets = ['module:@react-native/babel-preset', '@babel/preset-flow'];
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'jest-hoist',
        // stuff from Reanimated + web
        '@babel/plugin-proposal-export-namespace-from',
        'react-native-reanimated/plugin',
  ];

  return {
    presets,
    plugins,
  };
};
