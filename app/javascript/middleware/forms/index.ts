import {applyReducerHash} from '../../miq-redux/reducer';
import NewProviderForm from './new';
import {providerReducers} from '../new-provider-reducer';
import { AppState, Action } from '../../packs/miq-redux';

function newProviderReducer(state: AppState, action: Action): AppState {
    return ManageIQ.redux.applyReducerHash(providerReducers, state, action);
};

ManageIQ.redux.addReducer(newProviderReducer);
ManageIQ.angular.app.component('newProviderForm', new NewProviderForm);