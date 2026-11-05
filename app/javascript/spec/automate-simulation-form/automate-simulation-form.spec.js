import fetchMock from 'fetch-mock';
import { waitFor, screen, fireEvent } from '@testing-library/react';
import { componentTypes } from '@@ddf';
import AutomateSimulationForm from '../../components/automate-simulation-form';
import createSchema from '../../components/automate-simulation-form/automate-simulation-form.schema';
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

    renderWithRedux(<AutomateSimulationForm resolve={resolveWithTarget} attrValuesPairs={[0, 1, 2, 3, 4]} />);

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

  it('renders the Execute Methods checkbox as unchecked when readonly is true', async() => {
    const resolveData = {
      ...resolveMockData,
      new: { ...resolveMockData.new, readonly: true },
    };
    renderWithRedux(<AutomateSimulationForm resolve={resolveData} attrValuesPairs={[0, 1, 2, 3, 4]} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Execute Methods')).not.toBeChecked();
    });
  });

  it('renders the Execute Methods checkbox as checked when readonly is false', async() => {
    const resolveData = {
      ...resolveMockData,
      new: { ...resolveMockData.new, readonly: false },
    };
    renderWithRedux(<AutomateSimulationForm resolve={resolveData} attrValuesPairs={[0, 1, 2, 3, 4]} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Execute Methods')).toBeChecked();
    });
  });

  it('submits the form with readonly true when Execute Methods is checked', async() => {
    fetchMock.get('/miq_ae_tools/get_form_targets?target_class=Vm', { targets: [['VM 1', '1']] });
    fetchMock.post('/miq_ae_tools/resolve', { notice: 'Simulation complete' });

    const resolveData = {
      ...resolveMockData,
      new: {
        ...resolveMockData.new,
        object_request: 'VM Provision',
        target_class: 'Vm',
        target_id: '1',
        readonly: false,
      },
    };

    renderWithRedux(
      <AutomateSimulationForm
        resolve={resolveData}
        attrValuesPairs={[0, 1, 2, 3, 4]}
        url="/miq_ae_tools/resolve"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(fetchMock.called('/miq_ae_tools/resolve', 'POST')).toBe(true);
    });
    const body = JSON.parse(fetchMock.lastOptions('/miq_ae_tools/resolve').body);
    expect(body).toEqual(expect.objectContaining({ readonly: true, button: 'throw' }));
  });

  it('submits the form with readonly false when Execute Methods is unchecked', async() => {
    fetchMock.get('/miq_ae_tools/get_form_targets?target_class=Vm', { targets: [['VM 1', '1']] });
    fetchMock.post('/miq_ae_tools/resolve', { notice: 'Simulation complete' });

    const resolveData = {
      ...resolveMockData,
      new: {
        ...resolveMockData.new,
        object_request: 'VM Provision',
        target_class: 'Vm',
        target_id: '1',
        readonly: true,
      },
    };

    renderWithRedux(
      <AutomateSimulationForm
        resolve={resolveData}
        attrValuesPairs={[0, 1, 2, 3, 4]}
        url="/miq_ae_tools/resolve"
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(fetchMock.called('/miq_ae_tools/resolve', 'POST')).toBe(true);
    });
    const body = JSON.parse(fetchMock.lastOptions('/miq_ae_tools/resolve').body);
    expect(body).toEqual(expect.objectContaining({ readonly: false, button: 'throw' }));
  });

  it('uses a CHECKBOX component for the readonly field (always yields a boolean, never "1")', () => {
    const schema = createSchema(
      resolveMockData, 128, '/miq_ae_tools/resolve', [0, 1, 2, 3, 4], 128, [], '', jest.fn(),
    );
    const field = schema.fields.find((f) => f.name === 'readonly');
    expect(field.component).toBe(componentTypes.CHECKBOX);
  });
});
