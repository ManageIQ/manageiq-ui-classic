import { getStore, addReducer, applyReducerHash, UPDATE_FORM, INIT_FORM } from '../miq-redux/lib';
import { MiqStore, IMiqReducerHash, AppState, Action } from '../miq-redux/redux-types';

export interface IUnbindReduxReducers {
  redux?: () => void;
  reducer?: () => void;
}

export interface IFormController {
  updateFormObject: () => void;
}

export abstract class DefaultFormController {
  protected unbind: IUnbindReduxReducers = {};
  protected reduxStore: MiqStore;
  public formObject: any;

  /**
   * Constructor which will get reduxStore and subscribes to it.
   * @param reducersHash optional, hash of reducers which will be added to rootReducer.
   */
  constructor(reducersHash?: IMiqReducerHash) {
    if (reducersHash) {
      this.unbind.reducer = addReducer(
        (state: AppState, action: Action) => applyReducerHash(reducersHash, state, action)
      );
    }
    this.reduxStore = getStore();
    this.unbind.redux = this.reduxStore.subscribe(() => this.updateFormObject());
  }

  /**
   * Method for updating form object with current store.
   */
  protected updateFormObject(): void {
    throw new Error('Controller should implement updateStore method');
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
    this.reduxStore.dispatch({ type: UPDATE_FORM, payload: this.formObject });
  }
  
  /**
   * Method which is fired on form init, it will fire action `INIT_FORM` for defining default values in form.
   */
  protected $onInit(): void {
    this.reduxStore.dispatch({ type: INIT_FORM });
  }
}