import { createStore, applyMiddleware, compose, Store} from 'redux';
import {rootReducer} from './app-reducer';

export type AppState = Object;

const composeEnhancers = window['.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

export function configureStore(initialState?: AppState): Store<AppState> {
  const middlewares = [];
  const enhancer = composeEnhancers(
    applyMiddleware(...middlewares),
  );

  return createStore<AppState>(
    rootReducer,
    initialState!,
    enhancer,
  );
}