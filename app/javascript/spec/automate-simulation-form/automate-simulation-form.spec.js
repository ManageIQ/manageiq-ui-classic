import React from 'react';
import fetchMock from 'fetch-mock';
import { waitFor } from '@testing-library/react';
import AutomateSimulationForm from '../../components/automate-simulation-form';
import { renderWithRedux } from '../helpers/mountForm';

describe('Automate Simulation Form', () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  const resolveMockData = {
    ae_result: 'ok',
    button_class: '',
    button_number: 1,
    instance_names: [
      'Request',
      'parse_provider_category',
      'parse_event_stream',
      'parse_automation_request',
      'MiqEvent',
      'GenericObject',
      'Event',
      'Automation',
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

  it('should render the simulation form correctly', async() => {
    const { container } = renderWithRedux(<AutomateSimulationForm resolve={resolveMockData} attrValuesPairs={[0, 1, 2, 3, 4]} />);

    // Wait for component to finish rendering
    await waitFor(() => {
      expect(container.querySelector('form')).toBeInTheDocument();
    });

    expect(container).toMatchSnapshot();
  });
});
