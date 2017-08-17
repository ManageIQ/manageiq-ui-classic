import NewProviderForm from './new';
import {providerReducers} from '../new-provider-reducer';
import { AppState, Action } from '../../packs/miq-redux';
import {addReducer, applyReducerHash} from '../../miq-redux/lib';
function newProviderReducer(state: AppState, action: Action): AppState {
    return applyReducerHash(providerReducers, state, action);
};

addReducer(newProviderReducer);
ManageIQ.angular.app.component('newProviderForm', new NewProviderForm);