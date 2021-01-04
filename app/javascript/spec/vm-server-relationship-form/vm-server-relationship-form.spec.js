import React from 'react';
import fetchMock from 'fetch-mock';
import { act } from 'react-dom/test-utils';
import VmServerRelationShipForm from '../../components/vm-server-relationship-form';
import { mount } from '../helpers/mountForm';

describe('Vm server relationship form component', () => {
  const servers = {
    resources: [
      { vm_id: '1', id: '1', name: 'foo' },
      { id: '2', name: 'bar' },
      { id: '3', name: 'baz' },
    ],
  };

  afterEach(() => {
    fetchMock.reset();
  });

  const url = '/api/servers?expand=resources&attributes=id,name,vm_id&sort_by=name&sort_order=desc';

  it('should request data after mount and set to state', async(done) => {
    fetchMock.getOnce(url, servers);
    let wrapper;

    await act(async() => {
      wrapper = mount(<VmServerRelationShipForm recordId="2" redirect="" />);
    });
    wrapper.update();

    expect(fetchMock.called(url)).toBe(true);
    expect(wrapper.find('input[name="serverId"]').prop('value')).toEqual('');
    done();
  });

  it('should request data after mount and set to state (with serverId)', async(done) => {
    fetchMock.getOnce('/api/servers?expand=resources&attributes=id,name,vm_id&sort_by=name&sort_order=desc', servers);
    let wrapper;

    await act(async() => {
      wrapper = mount(<VmServerRelationShipForm recordId="1" redirect="" />);
    });
    wrapper.update();

    expect(fetchMock.called(url)).toBe(true);
    expect(wrapper.find('input[name="serverId"]').prop('value')).toEqual('1');
    done();
  });
});
