import React from 'react';
import { mount, shallow } from 'enzyme';

import MiqToolbar from '../../components/miq-toolbar';
import DashboardToolbar from '../../components/dashboard_toolbar';
import TopologyToolbar from '../../components/topology_toolbar';

const dashboardData = [
  [
    {
      "custom": true,
      "name": "dashboard",
      "props": {
        "allowAdd":true,
        "allowReset":true,
        "locked":false,
        "items":[
            {"id":31,"type":"button","text":"add","image":"fa fa-pie-chart fa-lg","title":"Add this Chart Widget"},
        ],
      }
    }
  ]
];

const topologyData = [[{"custom": true, "name": "topology", "props": {}}]];

describe('<MiqToolbar />', () => {
  beforeEach(() => {  
    console.log('FOOOOOBAR');
    window.matchMedia = jest.fn();
    console.log('FOOOOOBAR 2');
  });

  it('renders DashboardToolbar', (done) => {
    const t = shallow(<MiqToolbar toolbars={dashboardData} />);
    expect(t.find(DashboardToolbar)).toHaveLength(1);
  });

  it('renders TopologyToolbar', (done) => {
    const t = shallow(<MiqToolbar toolbars={topologyData} />);
    expect(t.find(TopologyToolbar)).toHaveLength(1);
  });

//  it('renders MiqGenericToolbar', (done) => {
//    const t = shallow(<MiqToolbar toolbars={genericData} />);
//  });
});
