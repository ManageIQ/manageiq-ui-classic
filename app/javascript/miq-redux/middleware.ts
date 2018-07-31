import thunk from 'redux-thunk';
import { routerMiddleware } from 'connected-react-router';
import { compose } from 'redux';

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

/**
 * @param history history for redux routing for react components * 
 * @description
 *  routerMiddleware adds middleware which is listening for location changes and updates router state
 *  thunk is a middleware for async redux functions
 */

export const createMiddlewares = ({ history, middlewares = [] }) => composeEnhancers(routerMiddleware(history), thunk, ...middlewares);
