import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import fetchMock from 'fetch-mock';
import RemoveCatalogItemModal, {
  removeCatalogItems,
} from '../../components/remove-catalog-item-modal';

import '../helpers/miqSparkle';

describe('RemoveCatalogItemModal', () => {
  const item1 = '123';
  const item2 = '456';
  const url1 = `/api/service_templates/${item1}?attributes=services`;
  const url2 = `/api/service_templates/${item2}?attributes=services`;
  const apiResponse1 = {
    id: item1,
    name: 'name123',
    service_type: 'atomic',
    services: [],
  };
  const apiResponse2 = {
    id: item2,
    name: 'name456',
    service_type: 'atomic',
    services: [],
  };
  const store = configureStore()({});
  const dispatchMock = jest.spyOn(store, 'dispatch');

  beforeEach(() => {
    global.window ??= Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://example.com',
      },
      writable: true,
    });
  });

  afterEach(() => {
    fetchMock.reset();
  });

  it('should correctly set component state for single catalog item', async() => {
    fetchMock.getOnce(url1, apiResponse1);
    render(
      <Provider store={store}>
        <RemoveCatalogItemModal recordId={item1} />
      </Provider>
    );

    expect(fetchMock.called(url1)).toBe(true);

    await waitFor(() => {
      expect(fetchMock.calls(url1).length).toBe(1);
    });
  });

  it('should correctly set component state for multiple catalog items', async() => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    render(
      <Provider store={store}>
        <RemoveCatalogItemModal gridChecks={[item1, item2]} />
      </Provider>
    );

    expect(fetchMock.called(url1)).toBe(true);
    expect(fetchMock.called(url2)).toBe(true);

    await waitFor(() => {
      expect(fetchMock.calls(url1).length).toBe(1);
      expect(fetchMock.calls(url2).length).toBe(1);
    });
  });

  it('should correctly render modal for single catalog item', async() => {
    fetchMock.getOnce(url1, apiResponse1);
    const { container } = render(
      <Provider store={store}>
        <RemoveCatalogItemModal recordId={item1} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        container.querySelector('.cds--modal-content')
      ).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });

  it('should correctly render modal for multiple catalog items', async() => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const { container } = render(
      <Provider store={store}>
        <RemoveCatalogItemModal gridChecks={[item1, item2]} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        container.querySelector('.cds--modal-content')
      ).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('should correctly render modal for duplicate catalog items', async() => {
    fetchMock.getOnce(url1, apiResponse1).getOnce(url2, apiResponse2);
    const { container } = render(
      <Provider store={store}>
        <RemoveCatalogItemModal gridChecks={[item1, item1]} />
      </Provider>
    );

    await waitFor(() => {
      expect(
        container.querySelector('.cds--modal-content')
      ).toBeInTheDocument();
    });
    expect(container).toMatchSnapshot();
  });

  it('correctly initializes buttons', async() => {
    fetchMock.getOnce(url1, apiResponse1);
    render(
      <Provider store={store}>
        <RemoveCatalogItemModal recordId={item1} />
      </Provider>
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

  it('removeCatalogItems() works correctly', async() => {
    const postUrl = `/api/service_templates/${item1}`;
    fetchMock.getOnce(url1, apiResponse1);
    fetchMock.postOnce(postUrl, { action: 'delete' });
    render(
      <Provider store={store}>
        <RemoveCatalogItemModal recordId={item1} />
      </Provider>
    );

    await waitFor(() => {
      expect(fetchMock.called(url1)).toBe(true);
    });

    removeCatalogItems([apiResponse1]);

    await waitFor(() => {
      expect(fetchMock.called(postUrl)).toBe(true);
    });
  });
});
