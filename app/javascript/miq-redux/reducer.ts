import { Unsubscribe } from 'redux';

import { AppState, AppReducer, Action } from './redux-typings';

const reducers: Set<AppReducer> = new Set();

/**
 * Root reducer, used when creating the Redux store.
 *
 * The implementation simply invokes each registered `AppReducer`
 * in a loop.
 *
 * @param state Current application state.
 * @param action Action being dispatched.
 *
 * @returns New application state.
 */
export function rootReducer(state: AppState, action: Action): AppState {
  let newState = state;

  reducers.forEach((appReducer) => {
    newState = appReducer(newState, action);
  });

  return newState;
}

/**
 * Add given reducer to the list of registered application reducers.
 *
 * @param appReducer Reducer to add.
 *
 * @returns Function to remove (unsubscribe) the given reducer.
 */
export function addReducer(appReducer: AppReducer): Unsubscribe {
  reducers.add(appReducer);

  return () => {
    reducers.delete(appReducer);
  };
}

/**
 * Remove all registered application reducers.
 *
 * *For testing purposes only.*
 */
export function clearReducers(): void {
  reducers.clear();
}
