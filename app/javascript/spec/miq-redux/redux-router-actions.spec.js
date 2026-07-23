import configureStore from 'redux-mock-store';
import createReduxRoutingActions from '../../miq-redux/redux-router-actions';
import createMiddlewares from '../../miq-redux/middleware';
import { history } from '../../miq-component/react-history.js';

describe('Redux routing actions', () => {
  const mockStore = configureStore(createMiddlewares(history));
  let store;
  let dispatchSpy;
  let expectedPayload;

  beforeAll(() => {
    expectedPayload = {
      type: '@@router/NAVIGATE',
      payload: {},
    };
  });

  beforeEach(() => {
    store = mockStore({});
    dispatchSpy = jest.spyOn(store, 'dispatch');
  });

  it('Should dispatch push action', () => {
    const { push } = createReduxRoutingActions(store);
    expectedPayload.payload = { method: 'push', args: ['/foo'] };
    push('/foo');
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch replace action', () => {
    const { replace } = createReduxRoutingActions(store);
    expectedPayload.payload = { method: 'replace', args: ['/foo'] };
    replace('/foo');
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch go action', () => {
    const { go } = createReduxRoutingActions(store);
    expectedPayload.payload = { method: 'go', args: [2] };
    go(2);
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch goBack action', () => {
    const { goBack } = createReduxRoutingActions(store);
    expectedPayload.payload = { method: 'back', args: [] };
    goBack();
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch goForward action', () => {
    const { goForward } = createReduxRoutingActions(store);
    expectedPayload.payload = { method: 'forward', args: [] };
    goForward();
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });
});
