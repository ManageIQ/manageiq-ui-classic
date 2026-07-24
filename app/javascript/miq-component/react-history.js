import { createHashHistory } from 'history';

/**
 * Creates a history object for client-side hash-based browsing.
 *
 * Uses the `history` package directly (stable public API) rather than
 * react-router's internal UNSAFE_createHashHistory.
 */
export const history = createHashHistory();

/**
 * react-router v7's history only accepts a single active listener.
 * This fan-out wrapper allows multiple subscribers while using only one history.listen().
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
