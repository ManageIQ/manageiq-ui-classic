import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import ReconfigureVmForm from '../../components/reconfigure-vm-form/index';
import {
  valueFromHelpers, valueFromHelpersTwo, responseDataOne, responseDataThree, responseDataTwo,
  valueFromHelpersThree,
} from './data';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Reconfigure VM form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render reconfigure form with datatables', async(done) => {
    fetchMock.get('/vm_infra/reconfigure_form_fields/new,12', responseDataOne);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('div.disk-table-list')).toHaveLength(1);
    expect(wrapper.find('div.network-table-list')).toHaveLength(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form without datatables', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12,13', responseDataThree);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpersTwo} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('div.disk-table-list')).toHaveLength(0);
    expect(wrapper.find('div.network-table-list')).toHaveLength(0);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form and show hidden fields', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12,13', responseDataThree);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpersTwo} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('memory')).toBeDefined();
    expect(wrapper.find('mem_type')).toBeDefined();
    expect(wrapper.find('socket_count')).toBeDefined();
    expect(wrapper.find('cores_per_socket_count')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form and show disk add form', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataOne);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button.disk-add').simulate('click');
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('type')).toBeDefined();
    expect(wrapper.find('size')).toBeDefined();
    expect(wrapper.find('unit')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form and show network add form', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataOne);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button.network-add').simulate('click');
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('vlan')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form and show cd rom connect form', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button[title="Disconnect"]').simulate('click');
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button[title="Connect"]').simulate('click');
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('host_file')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form and show disk resize form', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button[title="Resize"]').simulate('click');
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('size')).toBeDefined();
    expect(wrapper.find('unit')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure sub form and click delete button', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button[title="Delete"]').simulate('click');
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('button[title="Cancel Delete"]')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render reconfigure form and click cd-rom disconnect button', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataTwo);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpers} />);
    });
    wrapper.update();
    await act(async() => {
      wrapper.find('button[title="Disconnect"]').simulate('click');
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('button[title="Cancel Disconnect"]')).toBeDefined();
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render form with only fields it has permission for', async(done) => {
    fetchMock.get('vm_infra/reconfigure_form_fields/new,12', responseDataOne);
    let wrapper;
    await act(async() => {
      wrapper = mount(<ReconfigureVmForm {...valueFromHelpersThree} />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.contains('Memory')).toBe(true);
    expect(wrapper.contains('Processor')).toBe(false);
    expect(wrapper.contains('Disks')).toBe(false);
    expect(wrapper.contains('Network Adapters')).toBe(false);
    expect(wrapper.contains('CD/DVD Drives')).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
