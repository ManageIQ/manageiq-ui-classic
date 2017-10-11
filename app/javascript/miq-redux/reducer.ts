import { Unsubscribe } from 'redux';

import { AppState, AppReducer, Action, AppReducerHash } from './redux-typings';

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

/**
 * Apply a collection of reducers, represented as `AppReducerHash`,
 * to compute new application state.
 *
 * The implementation looks for a key that matches action's `type`.
 * If present, the corresponding reducer is invoked to compute the
 * new state. Otherwise, original state is returned.
 *
 * @param reducerHash Reducer hash to use.
 * @param state Current application state.
 * @param action Action being dispatched.
 *
 * @returns New application state.
 */
export function applyReducerHash(reducerHash: AppReducerHash, state: AppState, action: Action): AppState {
  let newState = state;

  if (reducerHash.hasOwnProperty(action.type)) {
    newState = reducerHash[action.type](state, action);
  }

  return newState;
}
