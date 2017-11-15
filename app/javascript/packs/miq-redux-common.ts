import { IModule } from 'angular';

import { configureNgReduxStore } from '../miq-redux/store';
import { addReducer, applyReducerHash } from '../miq-redux/reducer';
import { ReduxStore, ReduxApi } from '../miq-redux/redux-typings';
import '../miq-redux/test-helper';

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
