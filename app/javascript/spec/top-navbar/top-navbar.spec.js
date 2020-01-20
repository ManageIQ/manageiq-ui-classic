import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import RightSection from '../../components/top-navbar/right-section';
import Help from '../../components/top-navbar/help';
import Notifications from '../../components/top-navbar/notifications';
import CustomLogo from '../../components/top-navbar/custom-logo';
import UserOptions from '../../components/top-navbar/user-options';
import '../helpers/sprintf';
import '../helpers/sendDataWithRx';
import '../helpers/miqCheckForChanges';
import '../helpers/miqChangeGroup';

describe('Top navbar tests', () => {
  let customLogo;
  let currentUser;
  let helpMenu;
  let opsExplorerAllowed;
  let applianceName;
  let miqGroups;
  let currentGroup;
  let userMenu;
  const initialState = {
    notificationReducer: {
      unreadCount: 1,
      isDrawerVisible: false,
    },
  };
  const mockStore = configureStore();
  const sendDataWithRxSpy = jest.spyOn(window, 'sendDataWithRx');
  const miqCheckForChangesSpy = jest.spyOn(window, 'miqCheckForChanges');
  const miqChangeGroupSpy = jest.spyOn(window, 'miqChangeGroup');

  beforeEach(() => {
    customLogo = true;
    currentUser = {
      name: 'Administrator',
      userid: 'admin',
    };
    helpMenu = [
      {
        id: 'help',
        title: 'Help',
        type: 'default',
        items: [
          {
            id: 'documentation',
            title: 'Documentation',
            type: 'default',
            items: [],
            visible: true,
            href: '/support/index?support_tab=about',
          },
          {
            id: 'about',
            title: 'About',
            type: 'modal',
            items: [],
            visible: true,
            href: 'javascript:void(0);',
          },
        ],
        visible: true,
        href: '/dashboard/maintab/?tab=help',
      },
    ];
    opsExplorerAllowed = true;
    applianceName = 'EVM';
    miqGroups = [
      {
        id: '10000000000002',
        description: 'EvmGroup-super_administrator',
      },
      {
        id: '10000000000003',
        description: 'EvmGroup-dev',
      },
    ];
    currentGroup = {
      id: '10000000000002',
      description: 'EvmGroup-super_administrator',
    };
    userMenu = [
      {
        id: 'set',
        title: 'User Settings',
        href: null,
        items: [
          {
            id: 'configuration',
            title: 'My Settings',
            href: '/configuration/index',
            items: [],
            visible: true,
          },
          {
            id: 'my_tasks',
            title: 'Tasks',
            href: '/miq_task/index?jobs_tab=tasks',
            items: [],
            visible: true,
          },
        ],
        visible: true,
      },
    ];
  });

  afterEach(() => {
    sendDataWithRxSpy.mockReset();
    miqCheckForChangesSpy.mockReset();
    miqChangeGroupSpy.mockReset();
  });

  it('should render correctly', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <RightSection
          customLogo={customLogo}
          currentUser={currentUser}
          helpMenu={helpMenu}
          opsExplorerAllowed={opsExplorerAllowed}
          applianceName={applianceName}
          miqGroups={miqGroups}
          currentGroup={currentGroup}
          userMenu={userMenu}
        />
      </Provider>,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should call sendDataWithRx after click on help menu item with type "modal"', () => {
    const wrapper = mount(
      <Help helpMenu={helpMenu} />,
    );
    wrapper.find('a#help-menu-about').simulate('click');
    expect(sendDataWithRxSpy).toHaveBeenCalledWith({ type: 'showAboutModal' });
  });

  it('should call miqCheckForChanges after click on help menu item with type "default"', () => {
    const wrapper = mount(
      <Help helpMenu={helpMenu} />,
    );
    wrapper.find('a#help-menu-documentation').simulate('click');
    expect(miqCheckForChangesSpy).toHaveBeenCalled();
  });

  it('should dispatch toggleDrawerVisibility after click on notiffication button', () => {
    const store = mockStore({ ...initialState });
    const wrapper = mount(
      <Provider store={store}>
        <Notifications />
      </Provider>,
    );
    wrapper.find('a#notifications-btn').simulate('click');
    const expectedPayload = { type: '@@notifications/toggleDrawerVisibility' };
    expect(store.getActions()).toEqual([expectedPayload]);
  });

  it('should not render custom logo when disabled', () => {
    const wrapper = mount(
      <CustomLogo customLogo={false} />,
    );
    expect(wrapper.find('li.dropdown.brand-white-label')).toHaveLength(1);
  });

  it('should not render badge when no unread notifications', () => {
    const store = mockStore({ ...initialState, notificationReducer: { unreadCount: 0 } });
    const wrapper = mount(
      <Provider store={store}>
        <Notifications />
      </Provider>,
    );
    expect(wrapper.find('span.badge.badge-pf-bordered').text()).toEqual('');
  });

  it('should call miqChangeGroup after click on inactive group', () => {
    const wrapper = mount(
      <UserOptions currentUser={currentUser} applianceName={applianceName} miqGroups={miqGroups} currentGroup={currentGroup} userMenu={userMenu} />,
    );
    wrapper.find('a#EvmGroup-dev').simulate('click');
    expect(miqChangeGroupSpy).toHaveBeenCalled();
  });

  it('should render disabled item in case of one group', () => {
    const wrapper = mount(
      <UserOptions currentUser={currentUser} applianceName={applianceName} miqGroups={[miqGroups[0]]} currentGroup={currentGroup} userMenu={userMenu} />,
    );
    expect(wrapper.find('a#single-group-item')).toHaveLength(1);
  });

  it('should call miqCheckForChanges after click on user menu item', () => {
    const wrapper = mount(
      <UserOptions currentUser={currentUser} applianceName={applianceName} miqGroups={miqGroups} currentGroup={currentGroup} userMenu={userMenu} />,
    );
    wrapper.find('a#user-menu-tasks').simulate('click');
    expect(miqCheckForChangesSpy).toHaveBeenCalled();
  });

  it('should call miqCheckForChanges before logout', () => {
    const wrapper = mount(
      <UserOptions currentUser={currentUser} applianceName={applianceName} miqGroups={miqGroups} currentGroup={currentGroup} userMenu={userMenu} />,
    );
    wrapper.find('a#logout-btn').simulate('click');
    expect(miqCheckForChangesSpy).toHaveBeenCalled();
  });
});
