/* eslint-disable no-undef */
import React from 'react';
import { AppRegistry } from 'react-native';
import { NavigationBar } from '@shoutem/ui';
import { AppBuilder } from 'shoutem-core';
import 'es6-symbol/implement';
import 'react-native-gesture-handler';
import extensions from './extensions.js';
// WebInjectionMark-font-imports
// Web styling
import '@shoutem/ui/web/style/Alert.scss';

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
