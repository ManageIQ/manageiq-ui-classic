import {createStore} from 'redux';
import {addReducer, applyReducerHash} from './reducer';
import {configureStore} from './store';
import { AppState, MiqStore } from '../packs/miq-redux';

ManageIQ.redux = {};

const store: MiqStore = configureStore({});

ManageIQ.redux.addReducer = addReducer;

ManageIQ.redux.store = store;

ManageIQ.redux.applyReducerHash = applyReducerHash;
