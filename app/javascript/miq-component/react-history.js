import { createHashHistory } from 'history';

/**
 * Creates a history object for client-side hash-based browsing.
 */
export const history = createHashHistory();

/**
 * Fan-out wrapper allowing multiple subscribers on a single history.listen().
 */
const routeChangeListeners = new Set();
history.listen((update) => {
  routeChangeListeners.forEach((fn) => fn(update));
});

/**
 * Subscribe to route changes. Returns an unsubscribe function.
 * @param {function} fn - callback receiving { action, location }
 * @returns {function} unlisten
 */
export const onRouteChange = (fn) => {
  routeChangeListeners.add(fn);
  return () => routeChangeListeners.delete(fn);
};
