import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import CloudNetworkForm from '../../components/cloud-network-form/cloud-network-form';
import '../helpers/miqSparkle';
import '../helpers/miqAjaxButton';
import * as networkModule from '../../helpers/network-providers';
import { mount } from '../helpers/mountForm';
import {shallow } from 'enzyme';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Cloud Network form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;
  const providersMock = [
    { href: 'http://localhost:3000/api/providers/4', id: '4', name: 'Provider 4' },
    { href: 'http://localhost:3000/api/providers/31', id: '31', name: 'Provider 31' },
    { href: 'http://localhost:3000/api/providers/8', id: '8', name: 'Provider 8' },
    { href: 'http://localhost:3000/api/providers/50', id: '50', name: 'Provider 50' },
    { href: 'http://localhost:3000/api/providers/18', id: '18', name: 'Provider 18' },
    { href: 'http://localhost:3000/api/providers/39', id: '39', name: 'Provider 39' }];

  const tenantsMock = {
    resources: [
      { href: 'http://localhost:3000/api/providers/8/cloud_tenants/1', id: '1', name: 'cloud-user-demo' },
      { href: 'http://localhost:3000/api/providers/8/cloud_tenants/2', id: '2', name: 'admin' },
    ],
  };

  const networkMock = {
    href: 'http://localhost:3000/api/cloud_networks/50',
    id: '50',
    name: 'ext',
    ems_ref: '121455-asad5516a-145dsa6-d1453ad',
    ems_id: '8',
    cidr: null,
    status: 'active',
    enabled: true,
    external_facing: true,
    cloud_tenant_id: '2',
    orchestration_stack_id: null,
    shared: true,
    provider_physical_network: 'datacentre',
    provider_network_type: 'vlan',
    provider_segmentation_id: '17',
    vlan_transparent: null,
    extra_attributes: { port_security_enabled: true, qos_policy_id: null, maximum_transmission_unit: 1496 },
    type: 'Type',
    cloud_tenant: { id: '2', name: 'admin' },
    ext_management_system: { name: 'OpenStack Network Manager' },
  };

  networkModule.networkProviders = jest.fn().mockReturnValue(new Promise(resolve => resolve(providersMock)));

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render form', (done) => {
    const wrapper = shallow(<CloudNetworkForm />);

    setImmediate(() => {
      wrapper.update();
      expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render edit variant', (done) => {
    fetchMock.get('/api/cloud_networks/1?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name', networkMock);
    const wrapper = shallow(<CloudNetworkForm cloudNetworkId="1" />);

    setImmediate(() => {
      wrapper.update();
      expect(submitSpyMiqSparkleOff).toHaveBeenCalled();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  describe('componentDidMount', () => {
    it('should set add variant initialValues', (done) => {
      const wrapper = mount(<CloudNetworkForm />);

      setImmediate(() => {
        wrapper.update();
        expect(wrapper.children().instance().state.initialValues).toEqual({
          enabled: true,
          external_facing: false,
          shared: false,
        });
        expect(wrapper.children().instance().state.ems).toEqual([
          { name: `<${__('Choose')}>` },
          { href: 'http://localhost:3000/api/providers/4', id: '4', name: 'Provider 4' },
          { href: 'http://localhost:3000/api/providers/31', id: '31', name: 'Provider 31' },
          { href: 'http://localhost:3000/api/providers/8', id: '8', name: 'Provider 8' },
          { href: 'http://localhost:3000/api/providers/50', id: '50', name: 'Provider 50' },
          { href: 'http://localhost:3000/api/providers/18', id: '18', name: 'Provider 18' },
          { href: 'http://localhost:3000/api/providers/39', id: '39', name: 'Provider 39' },
        ]);
        expect(wrapper.children().instance().state.isLoading).toEqual(false);
        done();
      });
    });

    it('should set edit variant initialValues', (done) => {
      fetchMock.get('/api/cloud_networks/1?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name', networkMock);
      fetchMock.get('/api/providers/8/cloud_tenants?expand=resources&attributes=id,name', tenantsMock);

      const wrapper = mount(<CloudNetworkForm cloudNetworkId="1" />);

      setImmediate(() => {
        wrapper.update();
        expect(wrapper.children().instance().state.initialValues).toEqual({
          ...networkMock,
          cloud_tenant: '2',
        });
        expect(wrapper.children().instance().state.ems).toEqual([{
          id: '8',
          name: 'OpenStack Network Manager',
        }]);
        expect(wrapper.children().instance().state.isLoading).toEqual(false);
        expect(wrapper.children().instance().state.cloudTenantName).toEqual('admin');
        done();
      });
    });
  });

  describe('cancel', () => {
    it('when adding a new', (done) => {
      const wrapper = mount(<CloudNetworkForm />);

      setImmediate(() => {
        wrapper.update();
        const button = wrapper.find('button').last();
        button.simulate('click');
        expect(spyMiqAjaxButton).toHaveBeenCalledWith('/cloud_network/create/new?button=cancel');
        done();
      });
    });

    it('when editing', (done) => {
      fetchMock.get('/api/cloud_networks/1?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name', networkMock);
      fetchMock.get('/api/providers/8/cloud_tenants?expand=resources&attributes=id,name', tenantsMock);

      const wrapper = mount(<CloudNetworkForm cloudNetworkId="1" />);

      setImmediate(() => {
        wrapper.update();
        wrapper.children().instance().cancelClicked();
        expect(spyMiqAjaxButton).toHaveBeenCalledWith('/cloud_network/update/1?button=cancel');
        done();
      });
    });
  });

  describe('save', () => {
    it('when adding a new', (done) => {
      const expectedValues = {
        enabled: true,
        external_facing: false,
        shared: false,
        vlan_transparent: false,
        cloud_tenant: { id: '8' },
      };
      const wrapper = mount(<CloudNetworkForm />);

      setImmediate(() => {
        wrapper.update();
        wrapper.children().instance().saveClicked({
          enabled: true,
          external_facing: false,
          shared: false,
          cloud_tenant: '8',
        });
        expect(spyMiqAjaxButton).toHaveBeenCalledWith('create/new?button=add', expectedValues, { complete: false });
        done();
      });
    });

    it('when editing', (done) => {
      const expectedValues = {
        ...networkMock,
        cloud_tenant: { id: '2', name: 'admin' },
      };
      fetchMock.get('/api/cloud_networks/1?attributes=cloud_tenant.id,cloud_tenant.name,ext_management_system.name', networkMock);
      fetchMock.get('/api/providers/8/cloud_tenants?expand=resources&attributes=id,name', tenantsMock);

      const wrapper = mount(<CloudNetworkForm cloudNetworkId="1" />);

      setImmediate(() => {
        wrapper.update();
        wrapper.children().instance().saveClicked({
          ...networkMock,
          cloud_tenant: '2',
        });
        expect(spyMiqAjaxButton).toHaveBeenCalledWith('/cloud_network/update/1?button=save', expectedValues, { complete: false });
        done();
      });
    });
  });
});
