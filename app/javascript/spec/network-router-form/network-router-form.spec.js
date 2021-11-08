import React from 'react';
import toJson from 'enzyme-to-json';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import NetworkRouterForm from '../../components/routers-form/index';
import * as networkModule from '../../helpers/network-providers';
import { mount } from '../helpers/mountForm';

require('../helpers/set_fixtures_helper.js');
require('../helpers/old_js_file_require_helper.js');
require('../helpers/miqSparkle.js');
require('../helpers/miqAjaxButton.js');

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

describe('Network Router form component', () => {
  let submitSpyMiqSparkleOn;
  let submitSpyMiqSparkleOff;
  let spyMiqAjaxButton;
  const providersMock = [
    { href: 'http://localhost:3000/api/providers/31', id: '31', name: 'Provider 31' },
    { href: 'http://localhost:3000/api/providers/8', id: '8', name: 'Provider 8' },
  ];

  const options = {
    method: 'OPTIONS',
    backendName: 'API',
    headers: {},
    credentials: 'include',
    body: null,
  };

  const networkMock = {
    href: 'http://localhost:3000/api/network_routers/3',
    id: '3',
    name: 'admin-project-router',
    admin_state_up: true,
    cloud_network_id: '50',
    cloud_tenant_id: '2',
    ems_id: '8',
    ems_ref: '1467fa65-2abe-4002-aa99-02b4087c39ea',
    status: 'ACTIVE',
    type: 'ManageIQ::Providers::Openstack::NetworkManager::NetworkRouter',
    network_group_id: null,
    extra_attributes: {
      distributed: false,
      high_availability: false,
      routes: [],
      external_gateway_info: {
        enable_snat: true,
        network_id: '6b3d0c3b-8b68-4c26-a493-5be44d160241',
        external_fixed_ips: [{ subnet_id: '1ca5cc3e-ffe1-44cf-94df-98a798489d06', ip_address: '10.9.60.151' }],
      },
    },
  };

  networkModule.networkProviders = jest.fn().mockReturnValue(new Promise((resolve) => resolve(providersMock)));

  beforeEach(() => {
    submitSpyMiqSparkleOn = jest.spyOn(window, 'miqSparkleOn');
    submitSpyMiqSparkleOff = jest.spyOn(window, 'miqSparkleOff');
    spyMiqAjaxButton = jest.spyOn(window, 'miqAjaxButton');
  });

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
    submitSpyMiqSparkleOn.mockRestore();
    submitSpyMiqSparkleOff.mockRestore();
    spyMiqAjaxButton.mockRestore();
  });

  it('should render add form', (done) => {
    const wrapper = shallow(<NetworkRouterForm />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });

  it('should render edit variant', async(done) => {
    fetchMock.get('/api/network_routers/3', networkMock);
    fetchMock.mock('/api/network_routers/3', { data: { form_schema: { fields: [] } } }, options);
    const wrapper = shallow(<NetworkRouterForm routerId="3" />);

    setImmediate(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
