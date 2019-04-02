import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import promiseMiddleware from 'redux-promise-middleware';

export default history => [
  routerMiddleware(history),
  thunk,
  promiseMiddleware(),
];
