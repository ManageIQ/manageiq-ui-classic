import React from 'react';
import { mount, shallow } from 'enzyme';

import { Toolbar } from '../../components/toolbar';
import { ToolbarButton } from '../../components/toolbar/ToolbarButton';
import { ToolbarGroup } from '../../components/toolbar/Toolbar';
import { ToolbarList } from '../../components/toolbar/ToolbarList';
import { ToolbarView } from '../../components/toolbar/ToolbarView';

import toolbarData from './data/toolbar-big.json';
import viewData from './data/toolbar-view.json';

describe('Toolbar', () => {
  it('Well it works ;-)', () => {
    const t = shallow(<Toolbar
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t).toMatchSnapshot();
  });

  it('renders the ToolbarView component', () => {
    const t = shallow(<Toolbar
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t.find(ToolbarView)).toHaveLength(1);
  });

  it('renders view buttons', () => {
    const t = mount(<Toolbar
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t.find('button.btn.btn-link')).toHaveLength(3);
  });

  it('renders groups', () => {
    const t = shallow(<Toolbar
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t.find(ToolbarGroup)).toHaveLength(4);
  });

  it('renders simple buttons', () => {
    const t = mount(<Toolbar
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t.find(ToolbarButton)).toHaveLength(2);
    expect(t.find(ToolbarButton).at(0).containsMatchingElement(<i className="fa fa-refresh fa-lg" />))
      .toBeTruthy();
  });

  it('renders drop-down buttons', () => {
    const t = mount(<Toolbar
      kebabLimit={0}
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t.find(ToolbarList)).toHaveLength(7);
    expect(t.find(ToolbarList).at(1).text()).toContain('Configuration');
    expect(t.find(ToolbarList).at(1).containsMatchingElement(<i className="fa fa-cog fa-lg" />))
      .toBeTruthy();
  });

  it('renders applies kebabLimit properly', () => {
    const t = mount(<Toolbar
      kebabLimit={3}
      onClick={() => {}}
      onViewClick={() => {}}
      groups={toolbarData}
      views={viewData}
      count={0}
    />);
    expect(t.find(ToolbarList)).toHaveLength(10);
  });
});
