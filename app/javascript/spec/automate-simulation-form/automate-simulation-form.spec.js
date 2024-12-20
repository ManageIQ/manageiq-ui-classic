import React from 'react';
import fetchMock from 'fetch-mock';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import AutomateSimulationForm from '../../components/automate-simulation-form';

describe('Automate Simulation Form', () => {
  const automateSimulationMockData = [
    {
      href: `/miq_ae_tools/resolve_react/new`,
    },
  ];

  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const resolveMockData = {
    ae_result: 'ok',
    button_class: '',
    button_number: 1,
    instance_names: [
      'Request', 'parse_provider_category', 'parse_event_stream', 
      'parse_automation_request', 'MiqEvent', 'GenericObject', 'Event', 'Automation'
    ],
    lastaction: null,
    new: {
      attrs: [[], [], [], [], []],
      instance_name: 'Request',
      object_message: 'create',
      object_request: '',
      readonly: true,
      starting_object: 'SYSTEM/PROCESS',
      target_class: null,
      target_id: null,
    },
    state_attributes: {},
    targets: null,
    target_classes: {
      AvailabilityZone: 'Availability Zone',
      CloudNetwork: 'Cloud Network',
      CloudObjectStoreContainer: 'Cloud Object Store Container',
      CloudSubnet: 'Cloud Subnet',
      CloudTenant: 'Cloud Tenant',
      CloudVolume: 'Cloud Volume',
      ContainerGroup: 'Container Pod',
      ContainerImage: 'Container Image',
      ContainerNode: 'Container Node',
      ContainerProject: 'Container Project',
      ContainerTemplate: 'Container Template',
      ContainerVolume: 'Container Volume',
      EmsCluster: 'Cluster',
      ExtManagementSystem: 'Provider',
      GenericObject: 'Generic Object',
      Host: 'Host',
      MiqGroup: 'Group',
      MiqTemplate: 'VM Template and Image',
      NetworkRouter: 'Network Router',
      NetworkService: 'Network Service',
      OrchestrationStack: 'Orchestration Stack',
      PhysicalChassis: 'Physical Chassis',
      PhysicalRack: 'Physical Rack',
      PhysicalServer: 'Physical Server',
      PhysicalStorage: 'Physical Storage',
      SecurityGroup: 'Security Group',
      SecurityPolicy: 'Security Policy',
      SecurityPolicyRule: 'Security Policy Rule',
      Service: 'Service',
      Storage: 'Datastore',
      Switch: 'Virtual Infra Switch',
      Tenant: 'Tenant',
      User: 'User',
      Vm: 'VM and Instance',
    },
  };

  it('should submit a new simulation', async() => {
    const wrapper = shallow(<AutomateSimulationForm
      resolve={resolveMockData}
      attrValuesPairs={[0, 1, 2, 3, 4]}
    />);

    fetchMock.get(`/miq_ae_tools/resolve_react/new?&expand=resources/`, automateSimulationMockData);
    await new Promise((resolve) => {
      setImmediate(() => {
        wrapper.update();
        expect(toJson(wrapper)).toMatchSnapshot();
        resolve();
      });
    });
  });
});
