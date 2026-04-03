import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import NotificationDrawer from '../../components/notification-drawer/notification-drawer';
import * as initNotifications from '../../notifications/init';
import '../helpers/miqFormatNotification';
import '../helpers/sprintf';
import notifications from '../fixtures/notifications.json';
import resources from '../fixtures/resources.json';
import {
  CLEAR_ALL,
  INIT_NOTIFICATIONS,
  MARK_ALL_READ,
  TOGGLE_DRAWER_VISIBILITY,
  TOGGLE_MAX_NOTIFICATIONS,
} from '../../miq-redux/actions/notifications-actions';

const lowerMaxNotifications = 1;

jest.mock('../../notifications/backend.js', () => ({
  load: (_useLimit) => {},
  maxNotifications: 1,
}));

describe('Notification drawer tests', () => {
  const initialState = {
    notificationReducer: {
      unreadCount: 2,
      isDrawerVisible: true,
      notifications,
      isDrawerExpanded: false,
      totalNotificationsCount: 2,
      toastNotifications: [],
      maxNotifications: 100,
    },
  };
  const mockStore = configureStore([thunk]);
  const miqFormatNotificationSpy = jest.spyOn(window, 'miqFormatNotification');

  beforeEach(() => {
    jest.spyOn(initNotifications, 'default');
    initNotifications.default = () => {};
  });

  afterEach(() => {
    fetchMock.reset();
    miqFormatNotificationSpy.mockReset();
  });

  it('should render correctly', () => {
    const store = mockStore({ ...initialState });
    const { container } = render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(container).toMatchSnapshot();
  });

  it('should dispatch toggleDrawerVisibility after click on Close button', async() => {
    const user = userEvent.setup();
    const store = mockStore({ ...initialState });
    render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    const expectedPayload = { type: TOGGLE_DRAWER_VISIBILITY };
    expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should expand drawer after click on expand button', async() => {
    const user = userEvent.setup();
    const store = mockStore({ ...initialState });
    const { container } = render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );

    expect(
      container.querySelector('.notification-drawer-expanded'),
    ).not.toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: /collapsed/i });
    await user.click(expandButton);

    await waitFor(() => {
      expect(
        container.querySelector('.notification-drawer-expanded'),
      ).toBeInTheDocument();
    });
  });

  it('should dispatch markNotificationRead after click on notification content', async() => {
    const user = userEvent.setup();
    fetchMock.post('/api/notifications/', {
      action: 'mark_all_seen',
      resources: [{ id: '10000000003625' }],
    });
    const store = mockStore({ ...initialState });
    render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );

    const markAllReadBtn = screen.getByRole('button', {
      name: /mark all read/i,
    });
    await user.click(markAllReadBtn);

    const expectedPayload = [
      {
        type: '@@notifications/markAllRead',
      },
    ];
    expect(store.getActions()).toEqual(expectedPayload);
  });

  it('should show notification limit bar', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        maxNotifications: lowerMaxNotifications,
      },
    });
    const { container } = render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(
      container.querySelector('div.maxnotifications-text'),
    ).toBeInTheDocument();
  });

  it('should dispatch toogleMaxNotifications after click on Show all', async() => {
    const user = userEvent.setup();
    const store = mockStore({
      ...initialState,
      maxNotifications: lowerMaxNotifications,
    });
    fetchMock.getOnce(
      '/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc',
      resources,
    );
    fetchMock.getOnce('/api/notifications', {});
    render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );

    const toggleButton = screen.getByRole('button', { name: /show all/i });
    await user.click(toggleButton);

    const expectedPayload = [
      expect.objectContaining({
        type: INIT_NOTIFICATIONS,
      }),
      {
        type: TOGGLE_MAX_NOTIFICATIONS,
      },
    ];
    expect(store.getActions()).toEqual(expectedPayload);
  });

  it('should dispatch markAllRead after click on Mark all read', async() => {
    const user = userEvent.setup();
    fetchMock.postOnce('/api/notifications/', {});
    const store = mockStore({ ...initialState });
    render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );

    const markAllReadBtn = screen.getByRole('button', {
      name: /mark all read/i,
    });
    await user.click(markAllReadBtn);

    const expectedPayload = {
      type: MARK_ALL_READ,
    };
    expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should clear all and init after click on Clear all', async() => {
    const user = userEvent.setup();
    fetchMock.postOnce('/api/notifications/', {});
    const store = mockStore({ ...initialState });
    const { maxNotifications } = store.getState().notificationReducer;
    const limitFragment = !!maxNotifications
      ? `&limit=${maxNotifications}`
      : '';
    fetchMock.getOnce(
      `/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc${limitFragment}`,
      resources,
    );
    fetchMock.getOnce('/api/notifications', {});
    render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );

    const expectedPayload = [
      {
        payload: [{ id: '10000000003625' }, { id: '10000000003624' }],
        type: CLEAR_ALL,
      },
      expect.objectContaining({
        type: INIT_NOTIFICATIONS,
      }),
    ];

    const clearAllBtn = screen.getByRole('button', { name: /clear all/i });
    await user.click(clearAllBtn);

    expect(store.getActions()).toEqual(expectedPayload);
  });

  it('should not render notification drawer when hidden', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        isDrawerVisible: false,
      },
    });
    render(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });
});
