import { IModule } from 'angular';

import { rootReducer, addReducer, clearReducers, applyReducerHash } from './reducer';

const app: IModule = miqApp;

// allow unit-testing specific module exports
if (jasmine) {
  app.constant('_rootReducer', rootReducer);
  app.constant('_addReducer', addReducer);
  app.constant('_clearReducers', clearReducers);
  app.constant('_applyReducerHash', applyReducerHash);
}
