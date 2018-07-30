import { IModule } from 'angular';
import { devToolsEnhancer, EnhancerOptions } from 'redux-devtools-extension/logOnlyInProduction';
import { connectRouter } from 'connected-react-router';
import { rootReducer } from './reducer';
import { createMiddlewares } from './middleware';
import { AppState } from './redux-typings';
import { history } from '../miq-component/react-history';

const devToolsOptions: EnhancerOptions = {};

/**
 * Configure Angular application to use Redux store using `ng-redux`
 * implementation.
 *
 * The store supports Redux DevTools browser extension in development
 * as well as production, allowing users to inspect application state.
 * In production, however, Redux DevTools runs in *log only* mode.
 * 
 * connectRouter is used for adding router reducer for react redux routing
 * createMiddlewares creates a middlewares for store
 *
 * @param app Angular application to configure.
 * @param initialState Initial application state.
 */
export function configureNgReduxStore(app: IModule, initialState: AppState): void {
  app.config(['$ngReduxProvider', ($ngReduxProvider) => {
    $ngReduxProvider.createStoreWith(
      connectRouter(history)(rootReducer),
      createMiddlewares({ history }),
      [devToolsEnhancer(devToolsOptions)],
      initialState);
  }]);
}
