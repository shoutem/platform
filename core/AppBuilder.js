/* eslint-disable max-classes-per-file */
import React, { Component, createContext } from 'react';
import { YellowBox } from 'react-native';
import {
  assertExtensionsExist,
  assertNotEmpty,
  callLifecycleFunction,
  createAppContextConsumer,
  getApplicationCanonicalObject,
  renderMainContent,
  renderProviders,
} from './services';

const APP_CONTEXT = Symbol('appContext');

export let AppContextProvider;

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
 * @param appData The context configured through the builder API.
 * @returns {App} The App class.
 */
function createApplication(appData) {
  const AppContext = createContext();

  const App = class App extends Component {
    constructor(props) {
      super(props);

      this.store = null;
      this.state = { appReady: false };
    }

    /**
     * Returns the extensions used to initialize the app.
     * @returns {*} The extensions.
     */
    getExtensions() {
      return { ...appData.extensions };
    }

    getProviders() {
      return { ...appData.providers };
    }

    /**
     * Return all registered screens available in the application.
     * @returns {*} Exported screens from all extensions
     */
    getScreens() {
      return { ...appData.screens };
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

    /**
     * Returns available themes in the app.
     * @returns {*} The screens.
     */
    getThemes() {
      return { ...appData.themes };
    }

    setScreens(screens) {
      Object.assign(appData.screens, screens);
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

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
      this.lifecyclePromise = callLifecycleFunction(
        this,
        appData.extensions,
        'appWillMount',
      ).then(() => this.setState({ appReady: true }));
    }

    componentDidMount() {
      this.lifecyclePromise
        .then(() =>
          callLifecycleFunction(this, appData.extensions, 'appDidMount'),
        )
        .then(() =>
          callLifecycleFunction(
            this,
            appData.extensions,
            'appDidFinishLaunching',
          ),
        );
    }

    componentWillUnmount() {
      callLifecycleFunction(this, appData.extensions, 'appWillUnmount');
    }

    render() {
      const { appReady } = this.state;

      if (!appReady) {
        return null;
      }

      const { extensions } = appData;
      const mainContent = renderMainContent(this, extensions);
      const renderedContent = renderProviders(extensions, mainContent);

      return (
        <AppContext value={{ screens: appData.screens }}>
          {renderedContent}
        </AppContext>
      );
    }
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
    this[APP_CONTEXT].extensions = { ...extensions };
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
    const appContext = { ...this[APP_CONTEXT] };

    assertExtensionsExist(appContext.extensions);
    AppContextProvider = createAppContextConsumer(appContext.extensions);

    appContext.screens = getApplicationCanonicalObject('screens', appContext);
    appContext.themes = getApplicationCanonicalObject('themes', appContext);

    return createApplication(appContext);
  }
}
