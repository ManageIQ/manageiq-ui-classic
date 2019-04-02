import { Reducer, Action as BaseAction, Store, Unsubscribe } from 'redux';

/**
 * Application state.
 *
 * Its shape depends on specific `AppReducer` functions added through
 * `ReduxApi`. Therefore, its shape is dynamic and declared simply as
 * `object`.
 */
export type AppState = object;

/**
 * Application reducer, operating on `AppState`.
 *
 * As per Redux design, reducers should
 * - be pure functions without side effects,
 * - return new state if `action` was acted upon, otherwise return
 *   original state.
 */
export type AppReducer = { [key: string]: Function };

/**
 * Redux action object.
 *
 * As per Redux design, each action must define the `type` property.
 * Any data associated with the action should go into the `payload`.
 */
export interface Action extends BaseAction {
  payload?: any;
}

/**
 * Redux store, holding application's state tree and providing
 * functions to dispatch actions and subscribe to state changes.
 */
export type ReduxStore = Store<AppState>;

/**
 * `ManageIQ.redux` API.
 */
export interface ReduxApi {
  store: ReduxStore;
  addReducer(appReducer: AppReducer);
}
