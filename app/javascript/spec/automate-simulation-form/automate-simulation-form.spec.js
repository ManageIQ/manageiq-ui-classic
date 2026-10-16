import { screen, waitFor } from '@testing-library/react';
import { renderWithRedux } from '../helpers/mountForm';
import AutomateSimulationForm from '../../components/automate-simulation-form/index';
import createSchema from '../../components/automate-simulation-form/automate-simulation-form.schema';

// AutomationSimulation renders a complex tree/tab widget that is not under test here.
jest.mock('../../components/AutomationSimulation', () => {
  const MockAutomationSimulation = () => <div data-testid="automation-simulation" />;
  MockAutomationSimulation.displayName = 'AutomationSimulation';
  return MockAutomationSimulation;
});

const baseResolve = {
  target_classes: { Vm: 'VM and Instance' },
  instance_names: ['Request'],
  new: {
    object_message: 'create',
    object_request: 'VM Provision',
    readonly: false,
    target_class: null,
    target_id: null,
    attrs: [],
  },
};

const makeProps = (readonly = false) => ({
  resolve: {
    ...baseResolve,
    new: { ...baseResolve.new, readonly },
  },
  maxNameLength: 128,
  url: '/miq_ae_tools/resolve',
  attrValuesPairs: [0, 1, 2, 3, 4],
  maxLength: 128,
});

describe('AutomateSimulationForm', () => {
  beforeEach(() => {
    window.http = {
      get: jest.fn(() => Promise.resolve({ targets: [] })),
      post: jest.fn(() => Promise.resolve({ notice: 'Simulation complete' })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async() => {
    const { container } = renderWithRedux(<AutomateSimulationForm {...makeProps()} />);
    await waitFor(() => expect(screen.getByLabelText('Execute Methods')).toBeInTheDocument());
    expect(container).toMatchSnapshot();
  });

  it('renders the Execute Methods checkbox as unchecked when readonly is false', async() => {
    renderWithRedux(<AutomateSimulationForm {...makeProps(false)} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Execute Methods')).not.toBeChecked();
    });
  });

  it('renders the Execute Methods checkbox as checked when readonly is true', async() => {
    renderWithRedux(<AutomateSimulationForm {...makeProps(true)} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Execute Methods')).toBeChecked();
    });
  });

  it('uses a CHECKBOX component for the readonly field (always yields a boolean, never "1")', () => {
    const { componentTypes } = jest.requireActual('@@ddf');
    const schema = createSchema(
      baseResolve, 128, '/miq_ae_tools/resolve', [0, 1, 2, 3, 4], 128, [], {}, jest.fn(),
    );
    const field = schema.fields.find((f) => f.name === 'readonly');
    expect(field.component).toBe(componentTypes.CHECKBOX);
  });
});
