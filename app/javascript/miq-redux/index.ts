import { IModule } from 'angular';
import { configureNgReduxStore } from './store';
import { addReducer, applyReducerHash } from './reducer';

export default (app: IModule) => {
  // configure Angular application to use ng-redux
  configureNgReduxStore(app, {});

  // initialize the namespace upon application startup
  app.run(['$ngRedux', ($ngRedux) => {
    ManageIQ.redux = {
      store: $ngRedux,
      addReducer,
      applyReducerHash
    };
  }]);
};
