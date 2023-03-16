import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import LiveMigrateForm from '../../components/live-migrate-form/index';
import {
  hosts,
} from './data';
import { mount } from '../helpers/mountForm';

require('../helpers/miqSparkle.js');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Live Migrate form component', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('should render live migrate form with host options', async(done) => {
    fetchMock.getOnce('/vm_cloud/live_migrate_form_fields/20', { hosts });
    let wrapper;
    await act(async() => {
      wrapper = mount(<LiveMigrateForm recordId="20" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('input[name="auto_select_host"]').props().disabled).toBe(false);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render live migrate form when hosts empty', async(done) => {
    const hosts = [];
    fetchMock.getOnce('/vm_cloud/live_migrate_form_fields/20', { hosts });
    let wrapper;
    await act(async() => {
      wrapper = mount(<LiveMigrateForm recordId="20" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(1);
    expect(wrapper.find('destination_host')).toHaveLength(0);
    expect(wrapper.find('input[name="auto_select_host"]').props().disabled).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should render live migrate form with multiple instances', async(done) => {
    let wrapper;
    await act(async() => {
      wrapper = mount(<LiveMigrateForm recordId="" />);
    });
    wrapper.update();
    expect(fetchMock.calls()).toHaveLength(0);
    expect(wrapper.find('destination_host')).toHaveLength(0);
    expect(wrapper.find('input[name="auto_select_host"]').props().disabled).toBe(true);
    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });
});
