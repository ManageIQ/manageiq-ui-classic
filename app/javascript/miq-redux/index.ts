import { IModule } from 'angular';

import { configureNgReduxStore } from './store';
import { addReducer, applyReducerHash } from './reducer';
import { ReduxStore, ReduxApi } from './redux-typings';
import './test-helper';

const app: IModule = ManageIQ.angular.app;

const initialState = {};

// configure Angular application to use ng-redux
configureNgReduxStore(app, initialState);

// initialize Redux namespace upon application startup
app.run(['$ngRedux', ($ngRedux: ReduxStore) => {
  const reduxApi: ReduxApi = {
    store: $ngRedux,
    addReducer,
    applyReducerHash
  };

  ManageIQ.redux = reduxApi;
}]);
