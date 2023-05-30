import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import EvacuateForm from '../../components/evacuate-form/index';
import {
  hosts,
} from './data';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('evacuate form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render evacuate form with host options', async(done) => {
    fetchMock.getOnce('/vm_cloud/evacuate_form_fields/40', { hosts });
    let wrapper;
    await act(async() => {
      wrapper = mount(<EvacuateForm recordId="40" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('input[name="auto_select_host"]').props().disabled).toBe(false);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render evacuate form when hosts empty', async(done) => {
    const hosts = [];
    fetchMock.getOnce('/vm_cloud/evacuate_form_fields/40', { hosts });
    let wrapper;
    await act(async() => {
      wrapper = mount(<EvacuateForm recordId="40" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('destination_host')).toHaveLength(0);
    expect(wrapper.find('input[name="auto_select_host"]').props().disabled).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render evacuate form with multiple instances', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<EvacuateForm recordId="" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(0);
    expect(wrapper.find('destination_host')).toHaveLength(0);
    expect(wrapper.find('input[name="auto_select_host"]').props().disabled).toBe(true);
    expect(wrapper.find('input[name="on_shared_storage"]').props().checked).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
