import { applyMiddleware, compose, createStore } from 'redux';
import createReducer from './reducer';
import createMiddlewares from './middleware';
import { history, onRouteChange } from '../miq-component/react-history';

import { notificationReducer } from './notification-reducer';
import formButtonsReducer from '../forms/form-buttons-reducer';
import miqCustomTabReducer from './miq-custom-tab-reducer';

const initialState = {
  router: { action: 'POP', location: history.location },
};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const initializeStore = () => {
  const store = createStore(
    createReducer({}),
    initialState,
    composeEnhancers(applyMiddleware(...createMiddlewares(history))),
  );

  // Keep router.location in Redux state in sync with the history object.
  onRouteChange(({ action, location }) => {
    store.dispatch({ type: '@@router/LOCATION_CHANGE', payload: { action, location } });
  });

  /**
   * storage for all future reducers
   */
  store.asyncReducers = {
    FormButtons: formButtonsReducer,
    notificationReducer,
    miqCustomTabReducer,
  };

  /**
   * @param {Object} reducers object where key is the name of reducer and value reducer function
   */
  store.injectReducers = (reducers) => {
    store.asyncReducers = {
      ...store.asyncReducers,
      ...reducers,
    };
    /**
     * replace current reducer with new function containing all new reducers
     * must be connected to router again
     */
    store.replaceReducer(createReducer({ asyncReducers: store.asyncReducers }));
    return store;
  };
  return store;
};

export default initializeStore;
