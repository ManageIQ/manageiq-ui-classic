import { addReducer, applyReducerHash } from './reducer';
import { configureStore } from './store';
import { MiqStore } from './redux-types';

ManageIQ.redux = {};

const store: MiqStore = configureStore({});

ManageIQ.redux.addReducer = addReducer;

ManageIQ.redux.store = store;

ManageIQ.redux.applyReducerHash = applyReducerHash;
