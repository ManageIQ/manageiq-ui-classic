import { configureStore } from '@reduxjs/toolkit';
import createReducer from './reducer';
import { taggingMiddleware } from './middleware';

import { notificationReducer } from './notification-reducer';
import formButtonsReducer from '../forms/form-buttons-reducer';
import miqCustomTabReducer from './miq-custom-tab-reducer';

const initializeStore = () => {
  /**
   * storage for all future reducers
   */
  const asyncReducers = {
    FormButtons: formButtonsReducer,
    notificationReducer,
    miqCustomTabReducer,
  };

  const store = configureStore({
    reducer: createReducer(asyncReducers),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(taggingMiddleware),
  });

  store.asyncReducers = asyncReducers;

  /**
   * @param {Object} reducers object where key is the name of reducer and value reducer function
   */
  store.injectReducers = (reducers) => {
    store.asyncReducers = {
      ...store.asyncReducers,
      ...reducers,
    };
    store.replaceReducer(createReducer(store.asyncReducers));
    return store;
  };

  return store;
};

export default initializeStore;
