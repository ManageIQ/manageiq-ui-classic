import { configureStore } from '@reduxjs/toolkit';

/**
 * Creates an RTK store that records every dispatched action.
 * Replaces redux-mock-store for tests that need store.getActions().
 *
 * @param {Function} reducer - combined reducer for the test
 * @param {Object} preloadedState - initial state
 */
export const makeStore = (reducer, preloadedState) => {
  const actions = [];
  const store = configureStore({
    reducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(
        () => (next) => (action) => {
          actions.push(action);
          return next(action);
        },
      ),
  });
  store.getActions = () => actions;
  return store;
};
