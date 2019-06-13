import configureStore from 'redux-mock-store';
import { connectRouter } from 'connected-react-router';
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
      payload: {
      },
      type: '@@router/CALL_HISTORY_METHOD',
    };
  });

  beforeEach(() => {
    store = mockStore(connectRouter(history)(() => {}));
    dispatchSpy = jest.spyOn(store, 'dispatch');
  });

  it('Should dispatch push action', () => {
    const { push } = createReduxRoutingActions(store);
    expectedPayload.payload.args = ['/foo'];
    expectedPayload.payload.method = 'push';
    push('/foo');
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch replace action', () => {
    const { replace } = createReduxRoutingActions(store);
    expectedPayload.payload.args = ['/foo'];
    expectedPayload.payload.method = 'replace';
    replace('/foo');
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch go action', () => {
    const { go } = createReduxRoutingActions(store);
    expectedPayload.payload.args = [2];
    expectedPayload.payload.method = 'go';
    go(2);
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch goBack action', () => {
    const { goBack } = createReduxRoutingActions(store);
    expectedPayload.payload.args = [];
    expectedPayload.payload.method = 'goBack';
    goBack();
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });

  it('Should dispatch goForward action', () => {
    const { goForward } = createReduxRoutingActions(store);
    expectedPayload.payload.args = [];
    expectedPayload.payload.method = 'goForward';
    goForward();
    expect(dispatchSpy).toHaveBeenCalledWith(expectedPayload);
  });
});
