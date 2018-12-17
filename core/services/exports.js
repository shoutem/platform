/**
 * Helper function for extraction of registered type from extensions
 * returns an object where keys are names of all registered object types
 * @param extensions {Object} The extensions registered through App builder API
 * @param exportName {String} what to extract from extensions
 * @returns {Object}
 */
export function extractNamedExports(extensions, exportName) {
  return Object.keys(extensions).reduce((prevResult, key) => {
    const extension = extensions[key];
    let result = prevResult;
    if (extension[exportName]) {
      result = {
        ...prevResult,
        [key]: extension[exportName],
      };
    }

    return result;
  }, {});
}

/**
 * Extracts all named export registered by extensions. This function will
 * return an flattened.
 * @param extensions  The extensions configured through the builder API.
 * @param exportName  The extensions export name to extract.
 * @returns {Array} The array of all enhancers provided by extensions.
 */
export function extractFlattenedNamedExports(extensions, exportName) {
  const enhancers = extractNamedExports(extensions, exportName);

  if (process.env.NODE_ENV === 'development') {
    const extensionKeys = Object.keys(extensions);

    for (const key of extensionKeys) {
      const es = enhancers[key]; // could be undefined, could be an array...

      if (Array.isArray(es)) {
        const undefinedEnhancers = es.filter(e => typeof e === 'undefined');

        if (undefinedEnhancers.length > 0) {
          console.warn(`Invalid ${exportName} export detected in extension ` +
            `'${key}'. Check the index.js of that extension.`);
        }
      }
    }
  }

  // Flatten the middleware...
  const enhancerKeys = Object.keys(enhancers);
  const enhancersArray = enhancerKeys.reduce((res, key) => res.concat(enhancers[key]), []);
  const flattened = enhancersArray.reduce((res, arr) => res.concat(arr), []);

  // ...and remove invalid (undefined) values
  return flattened.filter(Boolean);
}
