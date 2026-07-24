import { UNSAFE_createHashHistory as createHashHistory } from 'react-router';

/**
 * Creates a history object for client-side hash-based browsing.
 * v5Compat:true ensures the listen() callback fires on push/replace as well as pop,
 * and passes the { action, location } update object that components expect.
 *
 * router documentation: https://reactrouter.com
 */
export const history = createHashHistory({ v5Compat: true });

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
