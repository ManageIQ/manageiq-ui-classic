import { createStore, applyMiddleware, compose, Store } from 'redux';
import { rootReducer } from './reducer';

import { AppState } from './redux-types';

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

export function configureStore(initialState?: AppState): Store<AppState> {
  const middlewares = [];
  const enhancer = composeEnhancers(
    applyMiddleware(...middlewares),
  );

  let reduxStore;
  if (ManageIQ.angular.app) {
    ManageIQ.angular.app
      .config(['$ngReduxProvider', ($ngReduxProvider) => {
        $ngReduxProvider.createStoreWith(rootReducer, middlewares, [enhancer], initialState);
      }])
      .run(['$ngRedux', ($ngRedux) => {
        ManageIQ.redux.store = ManageIQ.redux.store || $ngRedux;
      }]);
  } else {
    return reduxStore = createStore<AppState>(rootReducer,
      initialState!,
      enhancer);
  }
}
