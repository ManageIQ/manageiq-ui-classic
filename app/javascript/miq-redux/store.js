import { connectRouter } from 'connected-react-router';
import { applyMiddleware, compose, createStore } from 'redux';
import createReducer from './reducer';
import createMiddlewares from './middleware';
import { history } from '../miq-component/react-history';

const initialState = {};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const initializeStore = () => {
  const store = createStore(
    connectRouter(history)(createReducer()),
    initialState,
    composeEnhancers(applyMiddleware(...createMiddlewares(history))),
  );

  /**
   * storage for all future reducers
   */
  store.asyncReducers = {};

  /**
   * @param {Object} reducers object where key is the name of reducer and value reducer function
   */
  store.injectReducers = (reducers) => {
    Object.keys(reducers).forEach((key) => {
      store.asyncReducers[key] = reducers[key];
    });
    /**
     * replace current reducer with new function containing all new reducers
     * must be connected to router again
     */
    store.replaceReducer(connectRouter(history)(createReducer(store.asyncReducers)));
    return store;
  };
  return store;
};

export default initializeStore;

