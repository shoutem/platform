export {
  assertExtensionsExist,
  assertNotEmpty,
  createAppContextConsumer,
  extractCanonicalObjectsFromExtensions,
  getApplicationCanonicalObject,
  renderMainContent,
  renderProviders,
} from './builder';
export { extractFlattenedNamedExports, extractNamedExports } from './exports';
export { callLifecycleFunction } from './lifecycle';
export { isAndroid, isIos, isWeb } from './platform';
export {
  after,
  before,
  getPriority,
  priorities,
  prioritizeItems,
  setPriority,
} from './priority';
export { canonicalRenderResource, canonicalResource } from './resource';
export { restartApp } from './restart';
