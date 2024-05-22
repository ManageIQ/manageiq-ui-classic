import React from 'react';
import toJson from 'enzyme-to-json';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import { mount } from '../helpers/mountForm';
import HostInitiatorGroupForm from '../../components/host-initiator-group-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');
require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

describe('Host Initiator Group Form', () => {
  beforeEach(() => {
    fetchMock.mock(`/api/host_initiator_groups?expand=resources&attributes=name`, {
      resources: [],
    });
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const attributes = 'attributes=id,name,supports_block_storage';
  const filters = 'filter[]=supports_block_storage=true&filter[]=supports_create_host_initiator_group=true';

  it('Loads data and renders', async(done) => {
    fetchMock.mock(`/api/providers?expand=resources&${attributes}&${filters}`,
      {
        resources: [{
          href: 'https://9.151.190.173/api/providers/2',
          id: '2',
          name: '172',
          supports_block_storage: true,
        }],
      });
    fetchMock.mock('/api/providers/2?attributes=type,physical_storages',
      { physical_storages: [{ id: 1, name: '178' }, { id: 2, name: '179' }] });

    fetchMock.post('/api/host_initiator_groups', {});

    let wrapper;
    await act(async() => {
      wrapper = mount(<HostInitiatorGroupForm />);
    });
    wrapper.update();
    expect(fetchMock.called(`/api/providers?expand=resources&${attributes}&${filters}`)).toBe(true);
    expect(fetchMock.called('/api/providers/2?attributes=type,physical_storages')).toBe(false);

    await act(async() => {
      wrapper.find(`select[name="ems_id"]`).simulate('change', { target: { value: '2' } });
    });
    wrapper.update();
    expect(fetchMock.called('/api/providers/2?attributes=type,physical_storages')).toBe(true);

    await act(async() => {
      wrapper.find(`select[name="physical_storage_id"]`).simulate('change', { target: { value: '1' } });
      wrapper.find(`input[name="name"]`).simulate('change', { target: { value: 'my_group' } });
    });
    wrapper.update();

    await act(async() => {
      wrapper.find(`input[name="name"]`).simulate('change', { target: { value: 'my_group' } });
    });
    wrapper.update();

    expect(toJson(wrapper)).toMatchSnapshot();

    done();
  });

  it('Calls miqRedirectBack when canceling create form', async(done) => {
    fetchMock.mock(`/api/providers?expand=resources&${attributes}&${filters}`,
      {
        resources: [{
          href: 'https://9.151.190.173/api/providers/2', id: '2', name: '172', supports_block_storage: true,
        }],
      });
    fetchMock.mock('/api/providers/2?attributes=type,physical_storages',
      { physical_storages: [{ id: 1, name: '178' }, { id: 2, name: '179' }] });

    let wrapper;
    await act(async() => {
      wrapper = mount(<HostInitiatorGroupForm />);
    });
    wrapper.update();
    wrapper.find('button').last().simulate('click');
    const message = 'Creation of new Host Initiator Group was canceled by the user';
    expect(miqRedirectBack).toHaveBeenCalledWith(message, 'warning', '/host_initiator_group/show_list');
    done();
  });
});
