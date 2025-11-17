import { AppRegistry, LogBox } from 'react-native';
import { AppBuilder } from 'shoutem-core';
import 'es6-symbol/implement';
import extensions from './extensions.js';

// Suppress legacy warnings and errors
LogBox.ignoreLogs([
  'Support for defaultProps will be removed',
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillUpdate has been renamed',
  'Require cycle:',
]);

// Also suppress console.error for these warnings
const originalConsoleError = console.error;
const SUPPRESSED_WARNINGS = [
  'Support for defaultProps will be removed',
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillUpdate has been renamed',
];

console.error = function filterWarnings(msg, ...args) {
  if (!SUPPRESSED_WARNINGS.some((entry) => msg.includes(entry))) {
    originalConsoleError(msg, ...args);
  }
};

// import React from 'react';
// const whyDidYouRender = require('@welldone-software/why-did-you-render');

// whyDidYouRender(React, {
//   trackAllPureComponents: true,
//   collapseGroups: false,
//   trackHooks: true,
//   logOnDifferentValues: false,
//   logOwnerReasons: false,
// });

const App = new AppBuilder().setExtensions(extensions).build();

// noinspection JSCheckFunctionSignatures
AppRegistry.registerComponent('ShoutemApp', () => App);
