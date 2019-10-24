import React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import MainMenu from '../../components/main-menu/main-menu';
import TopLevel from '../../components/main-menu/top-level';
import SecondLevel from '../../components/main-menu/second-level';
import ThirdLevel from '../../components/main-menu/third-level';

describe('Main menu test', () => {
  let mockNavItems;

  beforeEach(() => {
    mockNavItems = [{
      id: 'vi',
      title: 'Cloud Intel',
      iconClass: 'fa fa-dashboard',
      href: '/dashboard/maintab/?tab=vi',
      preventHref: true,
      visible: true,
      active: true,
      type: 'default',
      items: [{
        id: 'dashboard',
        title: 'Dashboard',
        iconClass: null,
        href: '/dashboard/show',
        preventHref: false,
        visible: true,
        active: true,
        type: 'modal',
        items: [],
      }, {
        id: 'chargeback',
        title: 'Chargeback',
        iconClass: null,
        href: '/chargeback/explorer',
        preventHref: false,
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
      preventHref: true,
      visible: true,
      active: false,
      type: 'new_window',
      items: [{
        id: 'clo',
        title: 'Clouds',
        iconClass: 'fa fa-plus',
        href: '/dashboard/maintab/?tab=clo',
        preventHref: true,
        visible: true,
        active: false,
        type: 'new_window',
        items: [{
          id: 'ems_cloud',
          title: 'Providers',
          iconClass: null,
          href: '/ems_cloud/show_list',
          preventHref: false,
          visible: true,
          active: true,
          type: 'new_window',
          items: [],
        }, {
          id: 'availability_zone',
          title: 'Availability Zones',
          iconClass: null,
          href: '/availability_zone/show_list',
          preventHref: false,
          visible: true,
          active: false,
          type: 'default',
          items: [],
        }, {
          id: 'host_aggregate',
          title: 'Host Aggregates',
          iconClass: null,
          href: '/host_aggregate/show_list',
          preventHref: false,
          visible: false,
          active: false,
          type: 'new_window',
          items: [],
        }],
      }],
    }];
  });

  it('should render correctly', () => {
    const wrapper = mount(<MainMenu menu={mockNavItems} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render proper level components', () => {
    const wrapper = mount(<MainMenu menu={mockNavItems} />);
    expect(wrapper.find(TopLevel)).toHaveLength(2);
    expect(wrapper.find(SecondLevel)).toHaveLength(3);
    expect(wrapper.find(ThirdLevel)).toHaveLength(3);
  });

  it('should render active third level components properly', () => {
    const wrapper = mount(<MainMenu menu={mockNavItems} />);
    expect(wrapper.find(ThirdLevel).find('li.menu-list-group-item.active')).toHaveLength(1);
  });
});
