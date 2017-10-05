import { getStore, addReducer, applyReducerHash, UPDATE_FORM, INIT_FORM } from '../miq-redux/lib';
import { MiqStore, IMiqReducerHash, AppState, Action } from '../miq-redux/redux-types';

export interface IUnbindReduxReducers {
  redux?: () => void;
  reducer?: () => void;
}

export interface IFormController {
  mapStateToThis: (state: AppState) => any;
}

export abstract class DefaultFormController {
  protected unbind: IUnbindReduxReducers = {};
  protected reduxStore: any;
  public formObject: any;

  /**
   * Constructor which will get reduxStore and subscribes to it.
   * @param reducersHash optional, hash of reducers which will be added to rootReducer.
   */
  constructor(reducersHash?: IMiqReducerHash, protected Actions?) {
    if (reducersHash) {
      this.unbind.reducer = addReducer(
        (state: AppState, action: Action) => applyReducerHash(reducersHash, state, action)
      );
    }
    this.reduxStore = getStore();
    this.initForm();
    this.unbind.redux = this.reduxStore.connect(this.mapStateToThis, Actions)(this);
    this.reduxStore.subscribe(() => this.refreshForm());
  }

  protected refreshForm() {}

  protected mapStateToThis(state: AppState): any {
    throw new Error('Controller should implement mapStateToThis method');
  }

  public updateForm(payload) {
    throw new Error('Controller should implement updateForm method, did you forget to import it?');
  }

  public initForm() {
    this.reduxStore.dispatch({type: INIT_FORM});
  }

  /**
   * Method which is fired when component is destroyed.
   * It will unbind redux from current scope and if some reducers were passed in, it will unbind them from reducer
   * array as well.
   */
  public $onDestroy(): void {
    this.unbind.redux();
    if (this.unbind.reducer) {
      this.unbind.reducer();
    }
  }

  /**
   * Method which takes care of firing action `UPDATE_FORM`.
   * It will pass formObject as payload to it.
   */
  public onChangeForm(): void {
    this.updateForm(this.formObject);
  }
}
