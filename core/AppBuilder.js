import React, { Component } from 'react';
import { YellowBox } from 'react-native';
import PropTypes from 'prop-types';
import {
  assertExtensionsExist,
  assertNotEmpty,
  callLifecycleFunction,
  getApplicationCanonicalObject,
  renderMainContent,
  renderProviders,
} from './services';

const APP_CONTEXT = Symbol('appContext');

// Temporarily ignoring cyclic dependency warnings and deprecated lifecycle
// methods until package maintainers can resolve these
YellowBox.ignoreWarnings([
  'Require cycle:',
  'componentWillReceiveProps',
  'componentWillUpdate',
  'componentWillMount',
]);

/**
 * Creates an application class that represents a root
 * react native component, and uses the context initialized
 * through the AppBuilder API. Each call to this method will
 * return a new class.
 *
 * @param appContext The context configured through the builder API.
 * @returns {App} The App class.
 */
function createApplication(appContext) {
  const App = class App extends Component {

    constructor(props) {
      super(props);

      this.state = {
        style: null,
      };
      this.store = null;
    }

    getChildContext() {
      return { screens: appContext.screens };
    }

    /**
     * Returns the extensions used to initialize the app.
     * @returns {*} The extensions.
     */
    getExtensions() {
      return Object.assign({}, appContext.extensions);
    }

    getProviders() {
      return Object.assign({}, appContext.providers);
    }

    /**
     * Return all registered screens available in the application.
     * @returns {*} Exported screens from all extensions
     */
    getScreens() {
      return Object.assign({}, appContext.screens);
    }

    /**
     * Returns the redux state of the app.
     * @returns {*} The redux state.
     */
    getState() {
      return this.getStore().getState();
    }

    /**
     * Returns the redux store of the app.
     * @returns {*} The redux store.
     */
    getStore() {
      assertNotEmpty(this.store);
      return this.store;
    }

    getStyle() {
      return this.state.style;
    }

    /**
     * Returns available themes in the app.
     * @returns {*} The screens.
     */
    getThemes() {
      return Object.assign({}, appContext.themes);
    }

    setScreens(screens) {
      Object.assign(appContext.screens, screens);
    }

    /**
     * Return current redux store instance.
     *
     * *** WARNING ***
     * This function will be deprecated since store will be imported from `shoutem.redux` extension.
     *
     * @param {*} store Returns Redux store instance
     */
    setStore(store) {
      this.store = store;
    }

    setStyle(style) {
      this.setState({ style });
    }

    componentWillMount() {
      this.lifecyclePromise = callLifecycleFunction(this, appContext.extensions, 'appWillMount');
    }

    componentDidMount() {
      this.lifecyclePromise
        .then(() => callLifecycleFunction(this, appContext.extensions, 'appDidMount'))
        .then(() => callLifecycleFunction(this, appContext.extensions, 'appDidFinishLaunching'));
    }

    componentWillUnmount() {
      callLifecycleFunction(this, appContext.extensions, 'appWillUnmount');
    }

    render() {
      const extensions = appContext.extensions;
      const mainContent = renderMainContent(extensions);
      const renderedContent = renderProviders(extensions, mainContent);

      return renderedContent;
    }
  };

  App.propTypes = {
    children: PropTypes.node,
  };

  App.childContextTypes = {
    screens: PropTypes.object,
  };

  return App;
}

/**
 * Builds and initializes an App class that represents a root
 * react native component. Every call to the build method will
 * return a new App class that will use the data from the context
 * initialized through the AppBuilder.
 */
export class AppBuilder {

  constructor() {
    this[APP_CONTEXT] = {
      extensions: {},
      screens: {},
      themes: {},
    };
  }

  setExtensions(extensions) {
    this[APP_CONTEXT].extensions = Object.assign({}, extensions);
    return this;
  }

  /**
   * *** WARNING ***
   * This is only temporary here, it will be removed once shoutem.navigation ext is rewritten
   * in React Navigation.
   * For now, we have to support previous AppBuilder interface to avoid crashes.
   *
   * @param {Function} renderFunction Navigation bar render function
   */
  setRenderNavigationBar(renderFunction = () => {}) {
    this[APP_CONTEXT].renderNavigationBar = renderFunction;
    return this;
  }

  /**
   * Save only static content in app context, do not resolve dynamic content
   * which depends on state or it can be changed without new configuration.
   * We want everything to propagate through components properties and
   * automatically refreshes on update.
   */
  build() {
    // Capture the cloned appContext here, so that
    // each app gets its own context.
    const appContext = Object.assign({}, this[APP_CONTEXT]);

    assertExtensionsExist(appContext.extensions);

    appContext.screens = getApplicationCanonicalObject('screens', appContext);
    appContext.themes = getApplicationCanonicalObject('themes', appContext);

    return createApplication(appContext);
  }
}
