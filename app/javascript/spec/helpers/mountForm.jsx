import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render as rtlRender } from '@testing-library/react';

// React Testing Library helper
export const renderWithRedux = (component) => {
  return rtlRender(
    <Provider store={ManageIQ.redux.store}>
      {component}
    </Provider>
  );
};

/**
 * Creates a lightweight RTK store for testing.
 * Replaces redux-mock-store + thunk. The store:
 *  - uses a no-op reducer so preloadedState is returned as-is
 *  - records every dispatched action via store.getActions()
 *  - includes thunk (via RTK's getDefaultMiddleware) so async thunks work
 *
 * @param {Object} preloadedState  Initial Redux state for the test.
 * @returns Redux store with a getActions() method.
 */
export const makeStore = (preloadedState = {}) => {
  const actions = [];
  const store = configureStore({
    reducer: (state = preloadedState) => state,
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

