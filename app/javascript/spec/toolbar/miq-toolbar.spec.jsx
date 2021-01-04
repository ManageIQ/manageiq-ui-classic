import React from 'react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import { Toolbar } from '../../components/toolbar';
import MiqToolbar from '../../components/miq-toolbar';
import DashboardToolbar from '../../components/dashboard_toolbar';
import TopologyToolbar from '../../components/topology_toolbar';

const dashboardData = [
  [
    {
      custom: true,
      name: 'dashboard',
      props: {
        allowAdd: true,
        allowReset: true,
        locked: false,
        items: [
          {
            id: 31, type: 'button', text: 'add', image: 'fa fa-pie-chart fa-lg', title: 'Add',
          },
        ],
      },
    },
  ],
];

const genericData = [
  [
    {
      id: 'summary_reload',
      type: 'button',
      icon: 'fa fa-refresh fa-lg',
      name: 'summary_reload',
      title: 'Refresh this page',
    },
  ],
];

const topologyData = [[{ custom: true, name: 'topology', props: {} }]];

describe('<MiqToolbar />', () => {
  beforeEach(() => {
    window.matchMedia = jest.fn();
  });

  it('renders DashboardToolbar', () => {
    const t = shallow(<MiqToolbar kebabLimit={3} toolbars={dashboardData} />);
    expect(t.find(DashboardToolbar)).toHaveLength(1);
  });

  it('renders TopologyToolbar', () => {
    const t = shallow(<MiqToolbar kebabLimit={3} toolbars={topologyData} />);
    expect(t.find(TopologyToolbar)).toHaveLength(1);
  });

  it('renders Toolbar', () => {
    const t = shallow(<MiqToolbar kebabLimit={3} toolbars={genericData} />);
    expect(t.find(Toolbar)).toHaveLength(1);
  });
});
