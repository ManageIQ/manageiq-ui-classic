import {createStore, Store, Reducer} from 'redux';
import {addReducer} from './app-reducer';
import {configureStore, AppState} from './app-store';

ManageIQ.redux = {};

const store: Store<AppState> = configureStore({});

ManageIQ.redux.addReducer = addReducer;

ManageIQ.redux.store = store;