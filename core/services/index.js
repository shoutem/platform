export {
  assertExtensionsExist,
  assertNotEmpty,
  extractCanonicalObjectsFromExtensions,
  getApplicationCanonicalObject,
  renderMainContent,
  renderProviders,
} from './builder';

export {
  canonicalResource,
  canonicalRenderResource,
} from './resource.js';

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
