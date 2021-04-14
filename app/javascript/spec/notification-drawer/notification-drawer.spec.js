import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
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
  CLEAR_NOTIFICATION,
  INIT_NOTIFICATIONS,
  MARK_ALL_READ,
  MARK_NOTIFICATION_READ,
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
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should dispatch toggleDrawerVisibility after click on Close button', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    wrapper.find('Button[iconDescription="Close"]').simulate('click');
    const expectedPayload = { type: TOGGLE_DRAWER_VISIBILITY };
    expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should expand drawer after click on expand button', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('.notification-drawer-expanded')).toHaveLength(0);
    wrapper.find('Button[iconDescription="collapsed"]').simulate('click');
    expect(wrapper.find('.notification-drawer-expanded')).toHaveLength(1);
  });

  it('should dispatch markNotificationRead after click on notification content', async(done) => {
    fetchMock.post('/api/notifications/', {
      action: 'mark_all_seen',
      resources: [{ id: '10000000003625' }],
    });
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('Button#markAllReadBtn').first().simulate('click');
    });
    const expectedPayload = [
      {
        type: '@@notifications/markAllRead',
      },
    ];
    expect(store.getActions()).toEqual(expectedPayload);
    done();
  });

  it('should show notification limit bar', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        maxNotifications: lowerMaxNotifications,
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('div.maxnotifications-text')).toHaveLength(1);
  });

  it('should dispatch toogleMaxNotifications after click on Show all', async(done) => {
    const store = mockStore({ ...initialState, maxNotifications: lowerMaxNotifications });
    fetchMock.getOnce('/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc', resources);
    fetchMock.getOnce('/api/notifications', {});
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('#toggleMaxNotifications').first().simulate('click');
    });
    const expectedPayload = [
      expect.objectContaining({
        type: INIT_NOTIFICATIONS,
      }),
      {
        type: TOGGLE_MAX_NOTIFICATIONS,
      },
    ];
    expect(store.getActions()).toEqual(expectedPayload);
    done();
  });

  it('should dispatch markAllRead after click on Mark all read', async(done) => {
    fetchMock.postOnce('/api/notifications/', {});
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    await act(async() => {
      wrapper.find('button#markAllReadBtn').simulate('click');
    });
    const expectedPayload = {
      type: MARK_ALL_READ,
    };
    expect(store.getActions()).toEqual([expectedPayload]);
    done();
  });

  it('should clear all and init after click on Clear all', async(done) => {
    fetchMock.postOnce('/api/notifications/', {});
    const store = mockStore({ ...initialState });
    const { maxNotifications } = store.getState().notificationReducer;
    const limitFragment = !!maxNotifications ? `&limit=${maxNotifications}` : '';
    fetchMock.getOnce(`/api/notifications?expand=resources&attributes=details&sort_by=id&sort_order=desc${limitFragment}`, resources);
    fetchMock.getOnce('/api/notifications', {});
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    const expectedPayload = [{
      payload: [
        { id: '10000000003625' },
        { id: '10000000003624' },
      ],
      type: CLEAR_ALL,
    },
    expect.objectContaining({
      type: INIT_NOTIFICATIONS,
    }),
    ];
    await act(async() => {
      wrapper.find('button#clearAllBtn').simulate('click');
    });
    expect(store.getActions()).toEqual(expectedPayload);
    done();
  });

  it('should not render notification drawer when hidden', () => {
    const store = mockStore({
      ...initialState,
      notificationReducer: {
        ...initialState.notificationReducer,
        isDrawerVisible: false,
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <NotificationDrawer />
      </Provider>,
    );
    expect(wrapper.find('#miq-notifications-drawer-container')).toHaveLength(0);
  });
});
