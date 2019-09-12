import React from 'react';
import fetchMock from 'fetch-mock';
import VmServerRelationShipForm from '../../components/vm-server-relationship-form';
import '../helpers/miqAjaxButton';
import { mount } from '../helpers/mountForm';

describe('Vm server relationship form component', () => {
  const miqAjaxButtonSpy = jest.spyOn(window, 'miqAjaxButton');
  const servers = {
    resources: [
      { href: '/api/servers/7', id: '7', name: 'miq-5.9.0.21-TE4' },
      { href: '/api/servers/13', id: '13', name: 'miq-5.9.0.21-TE7' },
      { href: '/api/servers/1', id: '1', name: 'miq-5.9.0.21-TE1' },
      { href: '/api/servers/12', id: '12', name: 'miq-5.9.0.21-TE11' },
      { href: '/api/servers/4', id: '4', name: 'miq-5.9.0.21-TE3' },
      { href: '/api/servers/10', id: '10', name: 'miq-5.9.0.21-TE10' },
      { href: '/api/servers/14', id: '14', name: 'miq-5.9.0.21-TE13' },
      { href: '/api/servers/11', id: '11', name: 'miq-5.9.0.21-TE12' },
      { href: '/api/servers/8', id: '8', name: 'miq-5.9.0.21-TE8' },
      { href: '/api/servers/2', id: '2', name: 'miq-5.9.0.21-TE2' },
      { href: '/api/servers/6', id: '6', name: 'miq-5.9.0.21-TE5' },
      { href: '/api/servers/16', id: '16', name: 'EVM' },
    ],
  };

  const props = {
    vmId: '10',
  };

  afterEach(() => {
    fetchMock.reset();
    miqAjaxButtonSpy.mockReset();
  });

  it('should call cancel callback ', (done) => {
    fetchMock.getOnce('/api/servers?expand=resources&sort_by=name&sort_order=desc', servers);
    const wrapper = mount(<VmServerRelationShipForm {...props} />);

    setImmediate(() => {
      wrapper.update();
      wrapper.find('button').last().simulate('click');
      expect(miqAjaxButtonSpy).toHaveBeenCalledWith('/vm_or_template/evm_relationship_update/10?button=cancel');
      done();
    });
  });

  it('should request data after mount and set to state (no serverId)', (done) => {
    fetchMock.getOnce('/api/servers?expand=resources&sort_by=name&sort_order=desc', servers);
    const wrapper = mount(<VmServerRelationShipForm {...props} />);

    expect(fetchMock.called('/api/servers?expand=resources&sort_by=name&sort_order=desc')).toBe(true);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.children().state().initialValues).toEqual({
        serverId: undefined,
      });
      done();
    });
  });

  it('should request data after mount and set to state (with serverId)', (done) => {
    fetchMock.getOnce('/api/servers?expand=resources&sort_by=name&sort_order=desc', servers);
    const wrapper = mount(<VmServerRelationShipForm {...props} serverId="13" />);

    expect(fetchMock.called('/api/servers?expand=resources&sort_by=name&sort_order=desc')).toBe(true);

    setImmediate(() => {
      wrapper.update();
      expect(wrapper.children().state().initialValues).toEqual({
        serverId: '/api/servers/13',
      });
      done();
    });
  });

  it('should not submit values when form is not valid', (done) => {
    fetchMock.getOnce('/api/servers?expand=resources&sort_by=name&sort_order=desc', servers);
    const wrapper = mount(<VmServerRelationShipForm {...props} />);
    const spy = jest.spyOn(wrapper.children().instance(), 'onSubmit');

    setImmediate(() => {
      wrapper.update();
      const button = wrapper.find('button').first();
      button.simulate('click');
      expect(spy).toHaveBeenCalledTimes(0);
      done();
    });
  });

  it('onSubmit parses data and post to API', (done) => {
    fetchMock.getOnce('/api/servers?expand=resources&sort_by=name&sort_order=desc', servers);
    fetchMock.postOnce('/vm_or_template/evm_relationship_update/10?button=save', {});
    fetchMock.postOnce('/api/vms/10', {});

    const wrapper = mount(<VmServerRelationShipForm {...props} />);
    const values = {
      serverId: '/api/servers/16',
    };
    wrapper.children().instance().onSubmit(values).then(() => {
      expect(miqAjaxButtonSpy).toHaveBeenCalledWith('/vm_or_template/evm_relationship_update/10?button=save');
      expect(fetchMock.called('/api/vms/10',
        {
          action: 'set_miq_server',
          resource: {
            miq_server: {
              href: values.serverId,
            },
          },
        })).toBe(true);
      done();
    });
  });
});
