import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';

export const createMiddlewares = (history) => [
  routerMiddleware(history),
  thunk,
];
