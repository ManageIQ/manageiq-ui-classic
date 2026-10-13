import { render, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { makeStore } from '../helpers/mountForm';
import MarkdownPreview from '../../components/MarkdownPreview';

jest.mock('react-codemirror2', () => ({
  Controlled: ({ value, onBeforeChange }) => (
    <textarea
      data-testid="editor"
      value={value}
      onChange={(event) => onBeforeChange(null, null, event.target.value)}
    />
  ),
}));

jest.mock('../../components/MiqMarkdown', () => ({ content }) => (
  <div data-testid="preview">{content}</div>
));

describe('MarkdownPreview component', () => {
  const url = '/catalog/st_form_field_changed/new';
  let store;
  let textArea;

  const mountComponent = () => render(
    <Provider store={store}>
      <MarkdownPreview content="initial" url={url} type="CATALOG_EDIT_LONG_DESCRIPTION" />
    </Provider>
  );

  const type = (getByTestId, value) => fireEvent.change(getByTestId('editor'), { target: { value } });

  beforeEach(() => {
    jest.useFakeTimers();
    store = makeStore({ miqCustomTabReducer: 0 });
    window.miqObserveRequest = jest.fn();
    window.miq_refresh_code_mirror = jest.fn();
    textArea = document.createElement('textarea');
    textArea.id = 'long_description';
    document.body.appendChild(textArea);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.removeChild(textArea);
    delete window.miqObserveRequest;
    delete window.miq_refresh_code_mirror;
  });

  it('does not send a request on the initial render', () => {
    mountComponent();
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(window.miqObserveRequest).not.toHaveBeenCalled();
    expect(textArea.value).toEqual('initial');
  });

  it('updates the hidden textarea and preview immediately but delays the request', () => {
    const { getByTestId } = mountComponent();
    type(getByTestId, 'abc');

    expect(textArea.value).toEqual('abc');
    expect(getByTestId('preview')).toHaveTextContent('abc');
    expect(window.miqObserveRequest).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(window.miqObserveRequest).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(window.miqObserveRequest).toHaveBeenCalledTimes(1);
    expect(window.miqObserveRequest).toHaveBeenCalledWith(url, { data: { long_description: 'abc' } });
  });

  it('sends only the latest value for a burst of changes', () => {
    const { getByTestId } = mountComponent();
    type(getByTestId, 'a');
    act(() => {
      jest.advanceTimersByTime(200);
    });
    type(getByTestId, 'ab');
    act(() => {
      jest.advanceTimersByTime(200);
    });
    type(getByTestId, 'abc');
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(window.miqObserveRequest).toHaveBeenCalledTimes(1);
    expect(window.miqObserveRequest).toHaveBeenCalledWith(url, { data: { long_description: 'abc' } });
  });

  it('flushes a pending request when unmounted', () => {
    const { getByTestId, unmount } = mountComponent();
    type(getByTestId, 'pending');
    expect(window.miqObserveRequest).not.toHaveBeenCalled();

    unmount();

    expect(window.miqObserveRequest).toHaveBeenCalledTimes(1);
    expect(window.miqObserveRequest).toHaveBeenCalledWith(url, { data: { long_description: 'pending' } });
  });

  it('does not send anything on unmount when there are no pending changes', () => {
    const { unmount } = mountComponent();
    unmount();

    expect(window.miqObserveRequest).not.toHaveBeenCalled();
  });
});
