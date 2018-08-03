import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import promiseMiddleware from 'redux-promise-middleware';

export const createMiddlewares = (history) => [
  routerMiddleware(history),
  thunk,
  promiseMiddleware(),
];
