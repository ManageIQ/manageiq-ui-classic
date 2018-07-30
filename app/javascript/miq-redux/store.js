import { connectRouter } from 'connected-react-router';
import { createStore, applyMiddleware } from 'redux';
import { rootReducer } from './reducer';
import { createMiddlewares } from './middleware';
import { history } from '../miq-component/react-history';

const initialState = {};

export const store = createStore(
  connectRouter(history)(rootReducer),
  initialState,
  applyMiddleware( createMiddlewares({ history }) ),
);

