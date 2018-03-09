import { spyOnDeeply } from '../test-helpers/jest-mocks'
import miqRedux from './index';

import {
  rootReducer,
  addReducer,
  applyReducerHash,
  clearReducers
} from './reducer';

describe('Redux API', () => {

  let $ngRedux;
  let testReducers;

  beforeAll(() => {
    miqRedux(ManageIQ.angular.app);
  });

  beforeEach(() => {
    angular.mock.module('ManageIQ');
    angular.mock.inject((_$ngRedux_) => {
      $ngRedux = _$ngRedux_;
    });
  });

  beforeEach(() => {
    testReducers = {

      init(state, action) {
        if (action.type === 'TEST_INIT') {
          return { foo: 'hello', bar: true };
        }
        return state;
      },

      foo(state, action) {
        if (action.type === 'SET_FOO') {
          return Object.assign(state, { foo: action.payload });
        }
        return state;
      },

      bar(state, action) {
        if (action.type === 'RESET_BAR') {
          return Object.assign(state, { bar: false });
        }
        return state;
      }

    };

    Object.keys(testReducers).forEach(reducerName => {
      const spy = spyOnDeeply(testReducers, reducerName).mockName(`${reducerName}Reducer`);
      testReducers[`${reducerName}Spy`] = spy;
    });
  });

  afterEach(() => {
    clearReducers();
  });

  it('ManageIQ.redux namespace is defined', () => {
    expect(ManageIQ.redux).toBeDefined();
    expect(ManageIQ.redux.store).toBe($ngRedux);
    expect(ManageIQ.redux.addReducer).toEqual(expect.any(Function));
    expect(ManageIQ.redux.applyReducerHash).toEqual(expect.any(Function));
  });

  it('$ngRedux contains common Redux store methods', () => {
    expect($ngRedux.getState).toEqual(expect.any(Function));
    expect($ngRedux.dispatch).toEqual(expect.any(Function));
    expect($ngRedux.subscribe).toEqual(expect.any(Function));
  });

  it('$ngRedux complies with the standard Redux workflow', () => {
    const storeSubscribe = jest.fn().mockName('storeSubscribe');

    $ngRedux.subscribe(storeSubscribe);

    addReducer(testReducers.init);
    addReducer(testReducers.foo);
    addReducer(testReducers.bar);

    $ngRedux.dispatch({ type: 'TEST_INIT' });
    expect($ngRedux.getState()).toEqual({ foo: 'hello', bar: true });

    $ngRedux.dispatch({ type: 'SET_FOO', payload: 123 });
    expect($ngRedux.getState()).toEqual({ foo: 123, bar: true });

    $ngRedux.dispatch({ type: 'RESET_BAR' });
    expect($ngRedux.getState()).toEqual({ foo: 123, bar: false });

    expect(testReducers.initSpy).toHaveBeenCalledTimes(3);
    expect(testReducers.fooSpy).toHaveBeenCalledTimes(3);
    expect(testReducers.barSpy).toHaveBeenCalledTimes(3);
    expect(storeSubscribe).toHaveBeenCalledTimes(3);
  });

  it('rootReducer invokes all reducers registered via addReducer', () => {
    addReducer(testReducers.foo);
    addReducer(testReducers.bar);

    const newState = rootReducer(
      { foo: 'hello', bar: true },
      { type: 'SET_FOO', payload: 123 }
    );
    expect(newState).toEqual({ foo: 123, bar: true });

    expect(testReducers.fooSpy).toHaveBeenCalledWith(
      { foo: 'hello', bar: true },
      { type: 'SET_FOO', payload: 123 }
    );
    expect(testReducers.barSpy).toHaveBeenCalledWith(
      { foo: 123, bar: true },
      { type: 'SET_FOO', payload: 123 }
    );
  });

  it('rootReducer returns original state for an unknown action', () => {
    addReducer(testReducers.foo);
    addReducer(testReducers.bar);

    const originalState = { foo: 'hello', bar: true };
    const newState = rootReducer(
      originalState,
      { type: 'UNKNOWN' }
    );
    expect(newState).toBe(originalState);

    [testReducers.fooSpy, testReducers.barSpy].forEach(spy => {
      expect(spy).toHaveBeenCalledWith(
        { foo: 'hello', bar: true },
        { type: 'UNKNOWN' }
      );
    });
  });

  it('addReducer returns function to remove that reducer', () => {
    addReducer(testReducers.init);
    const removeFooReducer = addReducer(testReducers.foo);

    $ngRedux.dispatch({ type: 'TEST_INIT' });
    removeFooReducer();
    $ngRedux.dispatch({ type: 'TEST_INIT' });

    expect(testReducers.initSpy).toHaveBeenCalledTimes(2);
    expect(testReducers.fooSpy).toHaveBeenCalledTimes(1);
  });

  it('applyReducerHash invokes the right reducer if present', () => {
    const reducerHash = {
      'TEST_INIT': testReducers.init,
      'SET_FOO': testReducers.foo,
      'RESET_BAR': testReducers.bar
    };

    const newState = applyReducerHash(
      reducerHash,
      { foo: 'hello', bar: true },
      { type: 'SET_FOO', payload: 123 }
    );
    expect(newState).toEqual({
      foo: 123,
      bar: true
    });

    expect(testReducers.initSpy).toHaveBeenCalledTimes(0);
    expect(testReducers.fooSpy).toHaveBeenCalledTimes(1);
    expect(testReducers.barSpy).toHaveBeenCalledTimes(0);
  });

});
