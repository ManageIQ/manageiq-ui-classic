import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import RemoveGenericItemModal, {
  removeItems,
} from '../../components/remove-generic-item-modal';
import { renderWithRedux } from '../helpers/mountForm';

import '../helpers/miqFlashLater';
import '../helpers/miqSparkle';

describe('RemoveGenericItemModal', () => {
  const item1 = 123;
  const item2 = 456;
  const url1 = `/api/authentications/${item1}`;
  const url2 = `/api/authentications/${item2}`;
  const apiResponse1 = {
    id: item1,
    name: 'name123',
    supports_safe_delete: false,
  };
  const apiResponse2 = {
    id: item2,
    name: 'name456',
    supports_safe_delete: false,
  };
  const store = configureStore()({});
  const dispatchMock = jest.spyOn(store, 'dispatch');
  const modalData = {
    api_url: 'authentications',
    async_delete: true,
    redirect_url: '/go/home',
    modal_text: 'TEXT',
  };

  beforeEach(() => {
    global.window ??= Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com',
      },
      writable: true,
    });
    dispatchMock.mockClear();
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should correctly render modal for single item', async() => {
    fetchMock.getOnce(url1, apiResponse1);
    const { container } = renderWithRedux(
      <RemoveGenericItemModal
        store={store}
        recordId={item1}
        modalData={modalData}
      />
    );

    expect(fetchMock.called(url1)).toBe(true);

    await waitFor(() => {
      expect(screen.getByText(modalData.modal_text)).toBeInTheDocument();
      expect(screen.getByText(apiResponse1.name)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should correctly render modal for multiple items', async() => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const { container } = renderWithRedux(
      <RemoveGenericItemModal
        store={store}
        gridChecks={[item1, item2]}
        modalData={modalData}
      />
    );

    expect(fetchMock.called(url1)).toBe(true);
    expect(fetchMock.called(url2)).toBe(true);

    await waitFor(() => {
      expect(screen.getByText(modalData.modal_text)).toBeInTheDocument();
      expect(screen.getByText(apiResponse1.name)).toBeInTheDocument();
      expect(screen.getByText(apiResponse2.name)).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('correctly initializes buttons', async() => {
    fetchMock.getOnce(url1, apiResponse1);
    renderWithRedux(
      <RemoveGenericItemModal
        store={store}
        recordId={item1}
        modalData={modalData}
      />
    );

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'FormButtons.init',
        payload: {
          addClicked: expect.anything(),
          newRecord: true,
          pristine: true,
        },
      });
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'FormButtons.customLabel',
        payload: 'Delete',
      });
      expect(dispatchMock).toHaveBeenCalledWith({
        type: 'FormButtons.saveable',
        payload: true,
      });
    });
  });

  it('should render loading spinner initially', async() => {
    fetchMock.getOnce(url1, apiResponse1);
    const { container } = renderWithRedux(
      <RemoveGenericItemModal
        store={store}
        recordId={item1}
        modalData={modalData}
      />
    );
    expect(container.querySelector('.loadingSpinner')).toBeInTheDocument();

    // Wait for async operations to complete before unmounting
    await waitFor(() => {
      expect(screen.getByText(apiResponse1.name)).toBeInTheDocument();
    });
  });

  it('should render force delete checkbox when try_safe_delete is enabled', async() => {
    const modalDataWithSafeDelete = { ...modalData, try_safe_delete: true };
    const urlWithAttributes = `${url1}/?attributes=supports_safe_delete`;
    fetchMock.getOnce(urlWithAttributes, apiResponse1);
    renderWithRedux(
      <RemoveGenericItemModal
        store={store}
        recordId={item1}
        modalData={modalDataWithSafeDelete}
      />
    );

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /force delete/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked(); // force is true because supports_safe_delete is false
      expect(checkbox).toBeDisabled(); // disabled because item doesn't support safe delete
    });
  });

  it('removeItems() works correctly', async() => {
    const postUrl = `/api/authentications/${item1}`;
    fetchMock.getOnce(url1, apiResponse1);
    fetchMock.postOnce(postUrl, { success: true });
    renderWithRedux(
      <RemoveGenericItemModal
        store={store}
        recordId={item1}
        modalData={modalData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(apiResponse1.name)).toBeInTheDocument();
    });

    removeItems([apiResponse1], false, {
      apiUrl: modalData.api_url,
      asyncDelete: modalData.async_delete,
      redirectUrl: modalData.redirect_url,
    });

    await waitFor(() => {
      expect(fetchMock.called(postUrl)).toBe(true);
    });
  });
});
