import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { Provider } from 'react-redux';
import ToastList from '../../components/toast-list/toast-list';
import { MARK_NOTIFICATION_READ } from '../../miq-redux/actions/notifications-actions';
import { makeStore } from '../helpers/mountForm';
import notifications from '../fixtures/notifications.json';

describe('Toast list tests', () => {
  const initialState = {
    notificationReducer: {
      unreadCount: 1,
      isDrawerVisible: false,
      notifications,
      totalNotificationsCount: 0,
      toastNotifications: notifications,
      maxNotifications: 100,
    },
  };

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render correctly with notifications', () => {
    const store = makeStore({ ...initialState });
    const { container } = render(
      <Provider store={store}>
        <ToastList />
      </Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should not render without notifications', () => {
    const store = makeStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        notifications: [],
        toastNotifications: [],
      },
    });
    const { container } = render(
      <Provider store={store}>
        <ToastList />
      </Provider>
    );
    expect(
      container.querySelector('div.toast-notifications-list-pf')
    ).not.toBeInTheDocument();
  });

  it('should dispatch markNotificationRead after click on close button', async() => {
    const user = userEvent.setup();
    fetchMock.postOnce('/api/notifications/', {
      action: 'mark_all_seen',
      resources: [{ id: '10000000003624' }],
    });
    const store = makeStore(initialState);
    const { container } = render(
      <Provider store={store}>
        <ToastList />
      </Provider>
    );

    const closeButton = container.querySelector(
      'svg.cds--toast-notification__close-icon'
    );
    await user.click(closeButton);

    await waitFor(() => {
      const expectedPayload = {
        payload: '10000000003624',
        type: MARK_NOTIFICATION_READ,
      };
      expect(store.getActions()).toEqual([expectedPayload]);
    });
  });
});
