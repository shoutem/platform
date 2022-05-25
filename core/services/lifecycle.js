import _ from 'lodash';
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
  const lifecycleFunctions = extractFlattenedNamedExports(
    extensions,
    functionName,
  );
  const prioritizedLifecycleFunctions = prioritizeItems(lifecycleFunctions);

  return _.reduce(
    prioritizedLifecycleFunctions,
    (result, lifeCycle) => {
      return result.then(() => lifeCycle(app));
    },
    Promise.resolve(),
  );
}
