import { IModule } from 'angular';
import { devToolsEnhancer, EnhancerOptions } from 'redux-devtools-extension/logOnlyInProduction';

import { rootReducer } from './reducer';
import { middlewares } from './middleware';
import { AppState } from './redux-typings';

const devToolsOptions: EnhancerOptions = {};

/**
 * Configure Angular application to use Redux store using `ng-redux`
 * implementation.
 *
 * The store supports Redux DevTools browser extension in development
 * as well as production, allowing users to inspect application state.
 * In production, however, Redux DevTools runs in *log only* mode.
 *
 * @param app Angular application to configure.
 * @param initialState Initial application state.
 */
export function configureNgReduxStore(app: IModule, initialState: AppState): void {
  app.config(['$ngReduxProvider', ($ngReduxProvider) => {
    $ngReduxProvider.createStoreWith(
      rootReducer,
      middlewares,
      [devToolsEnhancer(devToolsOptions)],
      initialState);
  }]);
}
