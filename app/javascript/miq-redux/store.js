import { connectRouter } from 'connected-react-router';
import { applyMiddleware, compose, createStore } from 'redux';
import { rootReducer } from './reducer';
import { createMiddlewares } from './middleware';
import { history } from '../miq-component/react-history';

const initialState = {};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  connectRouter(history)(rootReducer),
  initialState,
  composeEnhancers(applyMiddleware(...createMiddlewares(history))),
);
