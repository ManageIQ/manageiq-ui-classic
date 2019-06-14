import { createHashHistory } from 'history';

export const history = createHashHistory();

/**
 * creates a history for client-side browsing
 * currently is used with redux to create redux controlled hash router
 * router documentations:
 * - connected-router: https://github.com/supasate/connected-react-router
 * - react-router: https://github.com/ReactTraining/react-router
 *
 * to use some react component with redux routing:
 * ... *
 * import { ConnectedRouter } from 'connected-react-router';
 * import history from 'manageiq-ui-classic/app/javascript/miq-component/react-history';
 * ...
 *
 * Somewhere in render method:
 * ...
 * <ConnectedRouter history={history}>
 * {Normal react router children}
 * </ConnectedRouter />
 * ...
 */
