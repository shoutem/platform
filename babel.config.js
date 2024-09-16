module.exports = function babelConfig(api) {
  api.cache.forever();

  const presets = ['module:@react-native/babel-preset', '@babel/preset-flow'];
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    'jest-hoist',
    'react-native-reanimated/plugin',
  ];

  return {
    presets,
    plugins,
  };
};
