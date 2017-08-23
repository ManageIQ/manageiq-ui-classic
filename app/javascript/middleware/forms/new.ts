import * as ng from 'angular';
import { getStore, addReducer, applyReducerHash } from '../../miq-redux/lib';
import { AppState, Action } from '../../miq-redux/redux-types';
import { MiqStore } from '../../miq-redux/redux-types';
import { INIT_NEW_PROVIDER, reducers, UPDATE_NEW_PROVIDER } from './new-provider-reducer';

export default class NewProviderForm implements ng.IComponentOptions {
  public templateUrl: string = '/static/middleware/new-provider.html.haml';
  public controller: any = NewProviderController;
  public controllerAs: string = 'newProv';
  public bindings: any = {
    types: '<',
    formFieldsUrl: '@',
    novalidate: '@',
    createUrl: '@'
  };
}

class NewProviderController {
  public types: any[];
  public componentState: Object;
  public newProvider: any;
  private formFieldsUrl: string;
  private novalidate: boolean;
  private createUrl: string;
  private reduxStore: MiqStore;
  private unbind: any = {};
  public $name: string = 'newProvider';
  private selects: NodeListOf<HTMLSelectElement>;

  public static $inject = ['$element'];

  constructor(private $element: Element) {
    this.unbind.reducer = addReducer(NewProviderController.applyReducers);
    this.reduxStore = getStore();
    this.unbind.redux = this.reduxStore.subscribe(() => this.updateStore());
  }

  private static applyReducers(state: AppState, action: Action) {
    return applyReducerHash(reducers, state, action);
  }

  public updateStore() {
    const currState: any = this.reduxStore.getState();
    this.newProvider = {...currState.providers.middleware.hawkular.newProvider};
  }

  public $onInit() {
    this.selects = this.$element.querySelectorAll('select');
    this.reduxStore.dispatch({ type: INIT_NEW_PROVIDER });
    setTimeout(() => (<any>angular.element(this.selects)).selectpicker('refresh'));
  }

  public onChangedProvider() {
    console.log(this.newProvider);
    this.reduxStore.dispatch({
      type: UPDATE_NEW_PROVIDER, payload: {
        name: this.newProvider.name,
        type: this.newProvider.type
      }
    });
  }

  public $onDestroy() {
    this.unbind.redux();
    this.unbind.reducer();
  }
}
