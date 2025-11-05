import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import VmSnapshotTree from '../../components/vm-snapshot-tree-select/snapshot-tree';
import { mount } from '../helpers/mountForm';

describe('VM Snaspthot Tree Select', () => {
  const url = `/${ManageIQ.controller}/snap_pressed/${encodeURIComponent(1)}`;
  const nodes = [{
    class: 'no-cursor',
    icon: 'pficon pficon-folder-close',
    key: 'root',
    selectable: false,
    text: 'test-root',
    tooltip: 'test-root',
    state: { expanded: true },
    nodes: [{
      icon: 'fa fa-camera',
      key: 'sn-1',
      selectable: true,
      text: 'test-child-1',
      tooltip: 'test-child-1',
      state: { expanded: true },
      nodes: [{
        icon: 'fa fa-camera',
        key: 'sn-1_sn-2',
        selectable: true,
        text: 'test-child-2',
        tooltip: 'test-child-2',
        state: { expanded: true },
      }],
    }],
  }];

  it('should render snapshot tree', (done) => {
    const wrapper = shallow(<VmSnapshotTree nodes={nodes} setSnapshot={() => {}} />);
    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should submit select API call', async(done) => {
    fetchMock.postOnce(url, {});
    const wrapper = mount(<VmSnapshotTree nodes={nodes} setSnapshot={() => {}} />);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
