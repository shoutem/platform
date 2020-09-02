export {
  assertExtensionsExist,
  assertNotEmpty,
  extractCanonicalObjectsFromExtensions,
  getApplicationCanonicalObject,
  renderMainContent,
  renderProviders,
  createAppContextConsumer,
} from './builder';

export {
  canonicalResource,
  canonicalRenderResource,
} from './resource';

export {
  extractNamedExports,
  extractFlattenedNamedExports,
} from './exports';

export {
  callLifecycleFunction,
} from './lifecycle';

export {
  after,
  before,
  getPriority,
  priorities,
  prioritizeItems,
  setPriority,
} from './priority';

export {
  restartApp,
} from './restart';
