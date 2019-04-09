# Shoutem Changelog

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
