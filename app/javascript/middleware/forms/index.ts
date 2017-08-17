import NewProviderForm from './new';
import {reducers} from './new-provider-reducer';
import { AppState, Action } from '../../packs/miq-redux';
import {addReducer, applyReducerHash} from '../../miq-redux/lib';

ManageIQ.angular.app.component('newProviderForm', new NewProviderForm());
