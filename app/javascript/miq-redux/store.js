import { applyMiddleware, compose, createStore } from 'redux';
import createReducer from './reducer';
import createMiddlewares from './middleware';
import { history } from '../miq-component/react-history.js';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const initializeStore = (initialState = {}, useHistory = true) => {
  const store = createStore(
    createReducer(useHistory ? { history } : {}),
    initialState,
    composeEnhancers(applyMiddleware(...createMiddlewares(useHistory && history))),
  );

  /**
   * storage for all future reducers
   */
  store.asyncReducers = {};

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
    store.replaceReducer(createReducer({ asyncReducers: store.asyncReducers, history: useHistory ? history : null }));
    return store;
  };
  return store;
};

export default initializeStore;
