import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import MainMenu from '../../components/main-menu/main-menu';
import TopLevel from '../../components/main-menu/top-level';
import SecondLevel from '../../components/main-menu/second-level';
import ThirdLevel from '../../components/main-menu/third-level';

describe('Main menu test', () => {
  let mockNavItems;
  const mockStore = configureStore();
  let store;

  beforeEach(() => {
    store = mockStore({
      menuReducer: {
        isVerticalMenuCollapsed: false,
      },
    });
    mockNavItems = [{
      id: 'vi',
      title: 'Cloud Intel',
      iconClass: 'fa fa-dashboard',
      href: '/dashboard/maintab/?tab=vi',
      visible: true,
      active: true,
      type: 'default',
      items: [{
        id: 'dashboard',
        title: 'Dashboard',
        iconClass: null,
        href: '/dashboard/show',
        visible: true,
        active: true,
        type: 'modal',
        items: [],
      }, {
        id: 'chargeback',
        title: 'Chargeback',
        iconClass: null,
        href: '/chargeback/explorer',
        visible: true,
        active: false,
        type: 'big_iframe',
        items: [],
      }],
    }, {
      id: 'compute',
      title: 'Compute',
      iconClass: 'pficon pficon-cpu',
      href: '/dashboard/maintab/?tab=compute',
      visible: true,
      active: false,
      type: 'new_window',
      items: [{
        id: 'clo',
        title: 'Clouds',
        iconClass: 'fa fa-plus',
        href: '/dashboard/maintab/?tab=clo',
        visible: true,
        active: false,
        type: 'new_window',
        items: [{
          id: 'ems_cloud',
          title: 'Providers',
          iconClass: null,
          href: '/ems_cloud/show_list',
          visible: true,
          active: true,
          type: 'new_window',
          items: [],
        }, {
          id: 'availability_zone',
          title: 'Availability Zones',
          iconClass: null,
          href: '/availability_zone/show_list',
          visible: true,
          active: false,
          type: 'default',
          items: [],
        }, {
          id: 'host_aggregate',
          title: 'Host Aggregates',
          iconClass: null,
          href: '/host_aggregate/show_list',
          visible: false,
          active: false,
          type: 'new_window',
          items: [],
        }],
      }],
    }];
  });

  it('should render correctly', () => {
    const wrapper = mount(<Provider store={store}><MainMenu menu={mockNavItems} /></Provider>).find(MainMenu);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render proper level components', () => {
    const wrapper = mount(<Provider store={store}><MainMenu menu={mockNavItems} /></Provider>);
    expect(wrapper.find(TopLevel)).toHaveLength(2);
    expect(wrapper.find(SecondLevel)).toHaveLength(3);
    expect(wrapper.find(ThirdLevel)).toHaveLength(3);
  });

  it('should render active third level components properly', () => {
    const wrapper = mount(<Provider store={store}><MainMenu menu={mockNavItems} /></Provider>);
    expect(wrapper.find(ThirdLevel).find('li.menu-list-group-item.active')).toHaveLength(1);
  });

  it('should render not collapsed vertical navbar with proper classNames', () => {
    const wrapper = mount(<Provider store={store}><MainMenu menu={mockNavItems} /></Provider>);
    expect(wrapper.find('#main-menu').instance().className).toEqual('nav-pf-vertical nav-pf-vertical-with-sub-menus nav-pf-vertical-collapsible-menus');
  });

  it('should render collapsed vertical navbar with proper classNames', () => {
    const collapsedStore = mockStore({
      menuReducer: {
        isVerticalMenuCollapsed: true,
      },
    });
    const wrapper = mount(<Provider store={collapsedStore}><MainMenu menu={mockNavItems} /></Provider>);
    expect(wrapper.find('#main-menu').instance().className).toEqual('nav-pf-vertical nav-pf-vertical-with-sub-menus nav-pf-vertical-collapsible-menus collapsed');
  });
});
