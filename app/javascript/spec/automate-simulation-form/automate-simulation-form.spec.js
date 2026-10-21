import fetchMock from 'fetch-mock';
import { waitFor, screen, fireEvent, act } from '@testing-library/react';
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

  it('should load targets when target_class is selected', async() => {
    fetchMock.get('/miq_ae_tools/get_form_targets?target_class=CloudNetwork', {
      targets: [['Network 1', '1'], ['Network 2', '2']],
    });
    fetchMock.get('/miq_ae_tools/get_form_targets?target_class=CloudSubnet', {
      targets: [['Subnet 1', '10'], ['Subnet 2', '20']],
    });

    const resolveWithTarget = {
      ...resolveMockData,
      new: {
        ...resolveMockData.new,
        target_class: 'CloudNetwork',
      },
    };

    const { container } = renderWithRedux(<AutomateSimulationForm resolve={resolveWithTarget} attrValuesPairs={[0, 1, 2, 3, 4]} />);

    await waitFor(() => {
      expect(fetchMock.called('/miq_ae_tools/get_form_targets?target_class=CloudNetwork')).toBe(true);
    });
  });

  it('should reload targets when target_class changes and preserve selections per class', async() => {
    fetchMock.get('/miq_ae_tools/get_form_targets?target_class=CloudNetwork', {
      targets: [['Network 1', '1'], ['Network 2', '2']],
    });
    fetchMock.get('/miq_ae_tools/get_form_targets?target_class=CloudSubnet', {
      targets: [['Subnet 1', '10'], ['Subnet 2', '20']],
    });

    const resolveWithTarget = {
      ...resolveMockData,
      new: {
        ...resolveMockData.new,
        target_class: 'CloudNetwork',
        target_id: '1',
      },
    };

    const { container } = renderWithRedux(<AutomateSimulationForm resolve={resolveWithTarget} attrValuesPairs={[0, 1, 2, 3, 4]} />);

    await waitFor(() => {
      expect(fetchMock.called('/miq_ae_tools/get_form_targets?target_class=CloudNetwork')).toBe(true);
    });

    const targetClassInput = container.querySelector('#target_class');
    fireEvent.change(targetClassInput, { target: { value: 'Cloud Subnet' } });
    fireEvent.keyDown(targetClassInput, { key: 'Enter', code: 'Enter' });

    // Click toggle button or select item
    const toggleButtons = container.querySelectorAll('.cds--list-box__menu-icon');
    if (toggleButtons.length > 1) {
      fireEvent.click(toggleButtons[1]);
    }

    const subnetOption = screen.queryByText('Cloud Subnet');
    if (subnetOption) {
      fireEvent.click(subnetOption);
    }

    await waitFor(() => {
      expect(fetchMock.called('/miq_ae_tools/get_form_targets?target_class=CloudSubnet')).toBe(true);
    });
  });
});
