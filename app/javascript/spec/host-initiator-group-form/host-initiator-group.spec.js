import React, {useState, useEffect} from 'react';

import { mount } from '../helpers/mountForm';

import toJson from 'enzyme-to-json';
import {act} from 'react-dom/test-utils';

import HostInitiatorGroupForm from '../../components/host-initiator-group-form';

require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');
require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');


import fetchMock from 'fetch-mock';
import miqRedirectBack from "../../helpers/miq-redirect-back";


describe("Host Initiator Group Form ", () => {
  beforeEach(() => {

  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('Loads data and renders ', async(done) => {
    fetchMock.mock('/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_create_host_initiator_group=true',
      {resources: [{"href":"https://9.151.190.173/api/providers/2","id":"2","name":"172","supports_block_storage":true}]}  )
    fetchMock.mock('/api/providers/2?attributes=type,physical_storages',
      {physical_storages: [{"id": 1, name: '178'}, {"id": 2, name: '179'}]})

    fetchMock.post('/api/host_initiator_groups', {})

    let wrapper;
    await act(async() => {
      wrapper = mount(<HostInitiatorGroupForm />);
    });
    wrapper.update()
    expect(fetchMock.called('/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_create_host_initiator_group=true')).toBe(true);
    expect(fetchMock.called('/api/providers/2?attributes=type,physical_storages')).toBe(false);

    act(() => {
      wrapper.find(`select[name="ems_id"]`).simulate('change', { target: { value: '2' } });
    });
    wrapper.update()
    expect(fetchMock.called('/api/providers/2?attributes=type,physical_storages')).toBe(true);

    act(() => {
      wrapper.find(`select[name="physical_storage_id"]`).simulate('change', { target: { value: '1' } });
      wrapper.find(`input[name="name"]`).simulate('change', { target: { value: 'my_group' } });
    });
    wrapper.update()

    act(() => {
      wrapper.find(`input[name="name"]`).simulate('change', { target: { value: 'my_group' } });
    });
    wrapper.update()

    expect(toJson(wrapper)).toMatchSnapshot();

    done();
  });

  it('Calls miqRedirectBack when canceling create form', async(done) => {
    fetchMock.mock('/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_create_host_initiator_group=true',
      {resources: [{"href":"https://9.151.190.173/api/providers/2","id":"2","name":"172","supports_block_storage":true}]}  )
    fetchMock.mock('/api/providers/2?attributes=type,physical_storages',
      {physical_storages: [{"id": 1, name: '178'}, {"id": 2, name: '179'}]})

    let wrapper;
    await act(async() => {
      wrapper = mount(<HostInitiatorGroupForm />);
    });
    wrapper.update()
    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Creation of new Host Initiator Group was canceled by the user', 'warning', '/host_initiator_group/show_list');
    done();
  });


});
