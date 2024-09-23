/* eslint-disable no-undef */
import React from 'react';
import { AppRegistry } from 'react-native';
import { NavigationBar } from '@shoutem/ui';
import { AppBuilder } from 'shoutem-core';
import 'es6-symbol/implement';
import extensions from './extensions.js';
// WebInjectionMark-font-imports
// Web styling
import '@shoutem/ui/web/style/Alert.scss';

// Supress current legacy errors
const consoleError = console.error;
const SUPPRESSED_WARNINGS = [
  'childContextTypes API which is no longer supported',
  'Support for defaultProps will be removed',
  'legacy contextTypes API which is no longer supported',
];

console.error = function filterWarnings(msg, ...args) {
  if (!SUPPRESSED_WARNINGS.some(entry => msg.includes(entry))) {
    consoleError(msg, ...args);
  }
};

// WebInjectionMark-font-styles

// WebInjectionMark-create-stylesheet

// WebInjectionMark-append-font-styles

// WebInjectionMark-inject-stylesheet

function renderNavigationBar(navBarProps) {
  return <NavigationBar {...navBarProps} />;
}

const App = new AppBuilder()
  .setExtensions(extensions)
  .setRenderNavigationBar(renderNavigationBar)
  .build();

AppRegistry.registerComponent('ShoutemApp', () => App);
AppRegistry.runApplication('ShoutemApp', {
  rootTag: document.getElementById('app-root'),
});
