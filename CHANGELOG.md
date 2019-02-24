# Shoutem Changelog

## [2.0.0]

Shoutem v2.0 brings you one big update - we no longer support React Navigation Experimental and have fully switched mobile client app to latest version of [React Navigation](https://reactnavigation.org/).

#### New features

  - Completely `shoutem.navigation` extension built on top of latest React Navigation
  - Added support for provider component registration. Example implementation can be found [here](https://github.com/shoutem/shoutem/blob/develop/app/extensions/shoutem.redux/app/index.js#L15)
  - Added support for dynamic extension content rendering. Example can be seen [here]()
  - Added new `shoutem.redux` extension to initialize Redux store and register all reducers and middlewares
    - Fetch store instance directly from `shoutem.redux` extension like `import { getStore } from 'shoutem.redux';`

#### Breaking changes

  - Removed `@shoutem/core` package and moved core Shoutem platform functionality to the mobile application
  - Navigation actions like `navigateTo` and `openInModal` are now deprecated in favor of using React Navigation's convention of `navigation` prop with custom actions. You can check list of all exported functions [here](https://github.com/shoutem/shoutem/blob/develop/app/extensions/shoutem.navigation/app/index.js)
  - Priority related helpers (`getPriority`, `setPriority`, `after`, `before`) are now moved to application's core module
  - `preventStateRehydration` moved from `@shoutem/core` to `shoutem.redux` extension
