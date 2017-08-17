import {createStore, Store, Reducer} from 'redux';
import {AppState} from './app-store';

export type AppReducer = Reducer<AppState>;

const reducers: Set<AppReducer> = new Set();

export const rootReducer: AppReducer = (state = {}, action) => {
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
