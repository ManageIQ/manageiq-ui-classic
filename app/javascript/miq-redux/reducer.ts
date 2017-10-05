import { createStore, Store, Reducer, Action } from 'redux';

import { IMiqAction, AppReducer, IMiqReducerHash, AppState } from './redux-types';

const reducers: Set<AppReducer> = new Set();

export const rootReducer: AppReducer = (state = {}, action: IMiqAction) => {
  let newState = state;

  reducers.forEach((reducer) => {
    newState = reducer(newState, action)
  });
  return newState;
};

export function addReducer(reducer: AppReducer) {
  reducers.add(reducer);
  return () => {
    reducers.delete(reducer);
  }
}

export function applyReducerHash(reducers: IMiqReducerHash, state: AppState, action: IMiqAction): AppState {
  return (reducers.hasOwnProperty(action.type) && reducers[action.type](state, action)) || state;
}
