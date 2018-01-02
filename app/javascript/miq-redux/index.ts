import { configureNgReduxStore } from './store';
import { rootReducer, addReducer, clearReducers, applyReducerHash } from './reducer';

const app = ManageIQ.angular.app;

const initialState = {};

// configure Angular application to use ng-redux
configureNgReduxStore(app, initialState);

// allow unit-testing specific module exports
if (window['jasmine']) {
  app.constant('_rootReducer', rootReducer);
  app.constant('_addReducer', addReducer);
  app.constant('_clearReducers', clearReducers);
  app.constant('_applyReducerHash', applyReducerHash);
}

// initialize Redux namespace upon application startup
app.run(['$ngRedux', ($ngRedux) => {
  ManageIQ.redux = {
    store: $ngRedux,
    addReducer,
    applyReducerHash
  };
}]);
