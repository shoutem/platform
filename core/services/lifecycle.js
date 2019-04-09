import { extractFlattenedNamedExports } from './exports';
import { prioritizeItems } from './priority';

/**
 * Calls the lifecycle function with the given name on all
 * extensions that export this function.
 *
 * @param app The app that will be passed to the lifecycle functions.
 * @param extensions The extensions of the app.
 * @param functionName The lifecycle function to call.
 * @returns {Promise} that will be resolved at the end of all lifecycle functions
 */
export function callLifecycleFunction(app, extensions, functionName) {
  const promises = [];
  const lifecycleFunctions = extractFlattenedNamedExports(extensions, functionName);
  const prioritizedLifecycleFunctions = prioritizeItems(lifecycleFunctions);

  prioritizedLifecycleFunctions.forEach((lifecycleFunction) => {
    if (typeof lifecycleFunction === 'function') {
      const result = lifecycleFunction(app);

      if (result instanceof Promise) {
        const wrappedPromise = new Promise(resolve =>
          result
            .then(() => resolve())
            .catch(() => resolve())
        );
        promises.push(wrappedPromise);
      }
    }
  });

  return Promise.all(promises);
}
