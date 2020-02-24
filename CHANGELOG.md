# Shoutem Changelog

## [2.2.0]

### New features

 - `shoutem.radio` extension which utilizes `react-native-track-player` `2.0.0-rc13` with a minor `patch-package` addition for live-stream setting so that the lock-screen controls show `Live` instead of a progress bar.
 - Added `AppName.entitlements` anchor for preBuild scripts
 - autolinking is now available if you add your custom extension's native dependency package name into the `nativeDependencies` array found in `dev-name.ext-name/app/package.json` file

### Deprecation changes

 - `dev-name.ext-name/app/package.json` should no longer contain `rnpm` scripts, instead, you can use `dev-name.ext-name/app/react-native.config.js` as described [here](https://github.com/react-native-community/cli/blob/master/docs/configuration.md#libraries)
 - deprecated lifecycle methods should be replaced (e.g. `componentWilLReceiveProps` with `getDerivedStateFromProps` and `componentWillUpdate` with `componentDidUpdate`)

### Breaking changes

 - `@shoutem/ui` no longer contains a `navigation` sub-folder, all imports from `@shoutem/ui/navigation` should now be imported from `shoutem.navigation` instead



## [2.0.0]

### New features

  - Added support for provider component registration. Example implementation can be found [here](https://github.com/shoutem/extensions/blob/master/shoutem.redux/app/index.js#L15)
  - Added new `shoutem.redux` extension to initialize the Redux store and register all reducers and middlewares
    - Fetch store instance directly from the `shoutem.redux` extension: `import { getStore } from 'shoutem.redux';`

### Breaking changes

  - Removed `@shoutem/core` package and moved core Shoutem platform functionality to the mobile application (`shoutem-core`)
  - `preventStateRehydration` has moved to the `shoutem.redux` extension
  - Priority related helpers (`getPriority`, `setPriority`, `after`, `before`) are now available in the `shoutem-core` package

### Notes

  - `NavigationBar` in the `@shoutem/ui/navigation` package has been deprecated. You should now import it from the `shoutem.navigation` extension, instead. For backward compatibility reasons, `NavigationBar` is still available in `@shoutem/ui`, but it will be removed in the future.
