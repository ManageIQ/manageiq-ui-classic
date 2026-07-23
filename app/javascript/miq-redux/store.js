import { configureStore } from '@reduxjs/toolkit';
import createReducer from './reducer';
import createMiddlewares from './middleware';

import { notificationReducer } from './notification-reducer';
import formButtonsReducer from '../forms/form-buttons-reducer';
import miqCustomTabReducer from './miq-custom-tab-reducer';

const initializeStore = () => {
  const asyncReducers = {
    FormButtons: formButtonsReducer,
    notificationReducer,
    miqCustomTabReducer,
  };

  const store = configureStore({
    reducer: createReducer({ asyncReducers }),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(...createMiddlewares()),
  });

  store.asyncReducers = asyncReducers;

  store.injectReducers = (reducers) => {
    store.asyncReducers = {
      ...store.asyncReducers,
      ...reducers,
    };
    store.replaceReducer(createReducer({ asyncReducers: store.asyncReducers }));
    return store;
  };

  return store;
};

export default initializeStore;
