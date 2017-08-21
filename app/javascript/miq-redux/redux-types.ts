import { Reducer, Action, Store } from 'redux';

export type AppReducer = Reducer<AppState>;
export interface IMiqAction extends Action {
  type: string;
  payload?: any;
}
export interface IMiqReducerHash {
  [propName: string]: AppReducer;
}

export type AppState = Object;

export type MiqStore = Store<AppState>;

export type Action = Action;
