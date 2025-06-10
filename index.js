import 'es6-symbol/implement';

import { AppRegistry } from 'react-native';

import { AppBuilder } from 'shoutem-core';

import extensions from './extensions.js';

const App = new AppBuilder()
  .setExtensions(extensions)
  .build();

// noinspection JSCheckFunctionSignatures
AppRegistry.registerComponent('ShoutemApp', () => App);
