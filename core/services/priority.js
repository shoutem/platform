export const priorities = Object.freeze({
  FIRST: 0,
  INIT: 100,
  NAVIGATION: 200,
  AUTH: 300,
  REDUX: 500,
  FIREBASE: 700,
  NETWORKING: 900,
  DEFAULT: 5000,
  LAST: Number(Infinity),
});

export const before = priority => priority - 1;

export const after = priority => priority + 1;

export const setPriority = (middleware, priority) => {
  // eslint-disable-next-line no-param-reassign
  middleware.priority = priority;

  return middleware;
};

export const getPriority = middleware => middleware.priority;

/**
 * Prioritizes a list of middleware. It assigns priorities.DEFAULT
 * to all middleware with no assigned priority and returns an array of middleware
 * sorted by priority. Priority is assigned by calling setPriority(middleware, priority)
 * where priority is one of the values defined in the priorities enum, e.g. priorities.INIT,
 * and is accessed by calling getPriority(middleware).
 * @param middleware The Array of middleware to prioritize.
 * @returns {Array} The array of all middleware prioritized and sorted by priority.
 */
export function prioritizeItems(items) {
  const itemsWithPriorities = items.map(item =>
    getPriority(item) ? item : setPriority(item, priorities.DEFAULT),
  );

  return itemsWithPriorities.sort((a, b) => a.priority - b.priority);
}
