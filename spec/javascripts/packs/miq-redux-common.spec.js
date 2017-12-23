describe('Redux API', function () {

  var $ngRedux;
  var rootReducer, addReducer, applyReducerHash;
  var initReducerSpy, fooReducerSpy, barReducerSpy;

  beforeEach(module('ManageIQ'));

  beforeEach(inject(function (_$ngRedux_, _rootReducer, _addReducer, _applyReducerHash) {
    $ngRedux = _$ngRedux_;
    rootReducer = _rootReducer;
    addReducer = _addReducer;
    applyReducerHash = _applyReducerHash;

    initReducerSpy = jasmine.createSpy('initReducer').and.callFake(function (state, action) {
      if (action.type === 'TEST_INIT') {
        return { foo: 'hello', bar: true };
      }
      return state;
    });

    fooReducerSpy = jasmine.createSpy('fooReducer').and.callFake(function (state, action) {
      if (action.type === 'SET_FOO') {
        return Object.assign(state, { foo: action.payload });
      }
      return state;
    });

    barReducerSpy = jasmine.createSpy('barReducer').and.callFake(function (state, action) {
      if (action.type === 'RESET_BAR') {
        return Object.assign(state, { bar: false });
      }
      return state;
    });

    [initReducerSpy, fooReducerSpy, barReducerSpy].forEach(function (spy) {
      spy.calls.saveArgumentsByValue();
    });
  }));

  afterEach(inject(function (_clearReducers) {
    _clearReducers();
  }));

  it('ManageIQ.redux namespace should be defined', function () {
    expect(ManageIQ.redux).toBeDefined();
    expect(ManageIQ.redux.store).toEqual($ngRedux);
    expect(ManageIQ.redux.addReducer).toEqual(jasmine.any(Function));
    expect(ManageIQ.redux.applyReducerHash).toEqual(jasmine.any(Function));
  });

  it('$ngRedux should contain common Redux store methods', function () {
    expect($ngRedux.getState).toEqual(jasmine.any(Function));
    expect($ngRedux.dispatch).toEqual(jasmine.any(Function));
    expect($ngRedux.subscribe).toEqual(jasmine.any(Function));
  });

  it('$ngRedux complies with the standard Redux workflow', function () {
    var storeSubscribeSpy = jasmine.createSpy('storeSubscribe');
    $ngRedux.subscribe(storeSubscribeSpy);

    addReducer(initReducerSpy);
    addReducer(fooReducerSpy);
    addReducer(barReducerSpy);

    $ngRedux.dispatch({ type: 'TEST_INIT' });
    expect($ngRedux.getState()).toEqual(jasmine.objectContaining({
      foo: 'hello',
      bar: true
    }));

    $ngRedux.dispatch({ type: 'SET_FOO', payload: 123 });
    expect($ngRedux.getState()).toEqual(jasmine.objectContaining({
      foo: 123,
      bar: true
    }));

    $ngRedux.dispatch({ type: 'RESET_BAR' });
    expect($ngRedux.getState()).toEqual(jasmine.objectContaining({
      foo: 123,
      bar: false
    }));

    expect(initReducerSpy.calls.count()).toEqual(3);
    expect(fooReducerSpy.calls.count()).toEqual(3);
    expect(barReducerSpy.calls.count()).toEqual(3);
    expect(storeSubscribeSpy.calls.count()).toEqual(3);
  });

  it('rootReducer invokes all reducers registered via addReducer', function () {
    addReducer(fooReducerSpy);
    addReducer(barReducerSpy);

    var newState = rootReducer(
      { foo: 'hello', bar: true },
      { type: 'SET_FOO', payload: 123 }
    );
    expect(newState).toEqual(jasmine.objectContaining({
      foo: 123,
      bar: true
    }));

    expect(fooReducerSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ foo: 'hello', bar: true }),
      jasmine.objectContaining({ type: 'SET_FOO', payload: 123 })
    );
    expect(barReducerSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ foo: 123, bar: true }),
      jasmine.objectContaining({ type: 'SET_FOO', payload: 123 })
    );
  });

  it('addReducer returns function to remove that reducer', function () {
    addReducer(initReducerSpy);
    var removeFooReducer = addReducer(fooReducerSpy);

    $ngRedux.dispatch({ type: 'TEST_INIT' });
    removeFooReducer();
    $ngRedux.dispatch({ type: 'TEST_INIT' });

    expect(initReducerSpy.calls.count()).toEqual(2);
    expect(fooReducerSpy.calls.count()).toEqual(1);
  });

  it('applyReducerHash should invoke the right reducer if present', function () {
    var reducerHash = {
      'TEST_INIT': initReducerSpy,
      'SET_FOO': fooReducerSpy,
      'RESET_BAR': barReducerSpy
    };

    var newState = applyReducerHash(
      reducerHash,
      { foo: 'hello', bar: true },
      { type: 'SET_FOO', payload: 123 }
    );
    expect(newState).toEqual(jasmine.objectContaining({
      foo: 123,
      bar: true
    }));

    expect(initReducerSpy.calls.count()).toEqual(0);
    expect(fooReducerSpy.calls.count()).toEqual(1);
    expect(barReducerSpy.calls.count()).toEqual(0);
  });

});
