import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import AbForm from '../../components/ab-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import {
  getRoles, getServiceDialogs, getButtonFormData, getInitialValues, getButtonTypes,
} from '../../components/ab-form/helper';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

jest.mock('../../components/ab-form/helper', () => ({
  getRoles: jest.fn(),
  getServiceDialogs: jest.fn(),
  getButtonFormData: jest.fn(),
  getInitialValues: jest.fn(),
  getButtonTypes: jest.fn(),
  buildSubmitData: jest.requireActual('../../components/ab-form/helper').buildSubmitData,
  canOpenUrl: jest.requireActual('../../components/ab-form/helper').canOpenUrl,
}));

jest.mock('../../components/fonticon-picker/font-icon-picker-ddf', () => ({
  __esModule: true,
  default: () => <div data-testid="font-icon-picker" />,
}));
jest.mock('../../components/condition-form/expression-editor-field', () => ({
  __esModule: true,
  default: () => <div data-testid="expression-editor" />,
}));

const nameField = () => screen.getByRole('textbox', { name: /^name/i });
const descriptionField = () => screen.getByRole('textbox', { name: /^description/i });
const requestField = () => screen.getByRole('textbox', { name: /^request/i });

const submitNewButton = async(user, { name = 'Test Button', description = 'A description', request = 'my_request' } = {}) => {
  await screen.findByRole('textbox', { name: /^name/i });
  await user.type(nameField(), name);
  await user.type(descriptionField(), description);
  await user.click(screen.getByRole('tab', { name: 'Advanced' }));
  await screen.findByRole('textbox', { name: /^request/i });
  await user.type(requestField(), request);
  await user.click(screen.getByRole('button', { name: 'Add' }));
};

const newDefaults = {
  inventory_type: 'localhost',
  attribute_pairs: [],
  options: {
    button_icon: 'ff ff-action',
    button_color: '#000000',
    button_type: 'default',
    display: true,
    display_for: 'single',
    submit_how: 'one',
    open_url: false,
  },
  resource_action: { ae_message: 'create', ae_instance: 'Request' },
  visibility: { roles: '_ALL_' },
};

const editValues = {
  id: '5',
  name: 'My Button',
  description: 'A description',
  applies_to_class: 'Vm',
  options: {
    button_icon: 'ff ff-check',
    button_color: '#ff0000',
    button_type: 'default',
    display: true,
    display_for: 'single',
    submit_how: 'one',
    open_url: false,
  },
  resource_action: { ae_instance: 'Request', ae_message: 'create', dialog_id: null },
  uri_attributes: { request: 'create' },
  visibility: { roles: '_ALL_' },
  enablement_expression: null,
  visibility_expression: null,
  disabled_text: null,
  attribute_pairs: [],
};

const defaultProps = {
  appliesToClass: 'Vm',
  formDataUrl: '/miq_ae_customization/ab_button_form_data',
  redirectUrl: '/miq_ae_customization/explorer',
};

beforeEach(() => {
  getRoles.mockResolvedValue([
    { label: 'EvmRole-administrator', value: '1' },
    { label: 'EvmRole-auditor', value: '2' },
  ]);
  getServiceDialogs.mockResolvedValue([{ label: 'My Dialog', value: 1 }]);
  getButtonFormData.mockResolvedValue({ distinct_instances: [], ansible_playbooks: [] });
  getInitialValues.mockResolvedValue(newDefaults);
  getButtonTypes.mockResolvedValue([
    { value: 'default', label: 'Default' },
    { value: 'ansible_playbook', label: 'Ansible Playbook' },
  ]);
});

afterEach(() => {
  fetchMock.removeRoutes();
  fetchMock.callHistory.clear();
});

describe('AbForm', () => {
  beforeAll(() => fetchMock.mockGlobal());

  describe('new button', () => {
    it('shows a loading spinner while data is fetched', () => {
      getInitialValues.mockReturnValue(new Promise(() => {}));
      renderWithRedux(<AbForm {...defaultProps} />);
      expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
    });

    it('renders the Options tab fields after loading', async() => {
      renderWithRedux(<AbForm {...defaultProps} />);

      await screen.findByRole('textbox', { name: /^name/i });
      expect(descriptionField()).toBeInTheDocument();
    });

    it('shows an inline error and no form when the initial data fails to load', async() => {
      getInitialValues.mockRejectedValue({ data: { error: { message: 'Load failed' } } });
      renderWithRedux(<AbForm {...defaultProps} />);

      expect(await screen.findByText('Load failed')).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /^name/i })).not.toBeInTheDocument();
    });

    it('renders both tabs', async() => {
      renderWithRedux(<AbForm {...defaultProps} />);

      await waitFor(() => expect(screen.getByRole('tab', { name: 'Options' })).toBeInTheDocument());
      expect(screen.getByRole('tab', { name: 'Advanced' })).toBeInTheDocument();
    });

    it('shows an Add button and a Cancel button', async() => {
      renderWithRedux(<AbForm {...defaultProps} />);

      await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument());
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not show a Reset button for new', async() => {
      renderWithRedux(<AbForm {...defaultProps} />);

      await waitFor(() => expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument());
      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
    });

    it('calls miqRedirectBack with warning on cancel', async() => {
      const user = userEvent.setup();
      renderWithRedux(<AbForm {...defaultProps} />);

      await waitFor(() => expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        __('Add of new Custom Button was cancelled by the user.'),
        'warning',
        '/miq_ae_customization/explorer',
      );
    });

    it('POSTs to /api/custom_buttons/ on submit and redirects', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', { results: [{ id: '99' }] });

      renderWithRedux(<AbForm {...defaultProps} />);
      await submitNewButton(user, { name: 'Test Button', description: 'A test button' });

      await waitFor(() => {
        expect(fetchMock.callHistory.calls('/api/custom_buttons/')).toHaveLength(1);
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.stringContaining('Test Button'),
          'success',
          '/miq_ae_customization/explorer',
        );
      });
    });

    it('shows an inline error notification on submit failure', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', {
        status: 400,
        body: { error: { message: 'Validation failed' } },
      });

      renderWithRedux(<AbForm {...defaultProps} />);
      await submitNewButton(user, { name: 'Bad Button', description: 'desc' });

      expect(await screen.findByText('Validation failed')).toBeInTheDocument();
    });
  });

  describe('edit button (recId present)', () => {
    beforeEach(() => {
      getInitialValues.mockResolvedValue(editValues);
    });

    it('shows a loading spinner while data is fetched', () => {
      getInitialValues.mockReturnValue(new Promise(() => {}));
      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
    });

    it('populates form fields with existing values', async() => {
      renderWithRedux(<AbForm {...defaultProps} recId={5} />);

      await waitFor(() => expect(screen.getByDisplayValue('My Button')).toBeInTheDocument());
      expect(screen.getByDisplayValue('A description')).toBeInTheDocument();
    });

    it('shows a Save button and a Reset button', async() => {
      renderWithRedux(<AbForm {...defaultProps} recId={5} />);

      await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument());
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('calls miqRedirectBack with warning on cancel', async() => {
      const user = userEvent.setup();
      renderWithRedux(<AbForm {...defaultProps} recId={5} />);

      await waitFor(() => expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        expect.stringContaining('My Button'),
        'warning',
        '/miq_ae_customization/explorer',
      );
    });

    it('PUTs to /api/custom_buttons/:id on save and redirects', async() => {
      const user = userEvent.setup();
      fetchMock.put('/api/custom_buttons/5', { id: '5', name: 'My Button' });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await waitFor(() => expect(screen.getByDisplayValue('My Button')).toBeInTheDocument());

      await user.clear(descriptionField());
      await user.type(descriptionField(), 'Updated description');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(fetchMock.callHistory.calls('/api/custom_buttons/5')).toHaveLength(1);
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.stringContaining('My Button'),
          'success',
          '/miq_ae_customization/explorer',
        );
      });
    });

    it('shows an inline error on save failure and allows dismissal', async() => {
      const user = userEvent.setup();
      fetchMock.put('/api/custom_buttons/5', {
        status: 400,
        body: { error: { message: 'Save failed' } },
      });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await waitFor(() => expect(screen.getByDisplayValue('My Button')).toBeInTheDocument());

      await user.clear(descriptionField());
      await user.type(descriptionField(), 'Changed');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Save failed')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(screen.queryByText('Save failed')).not.toBeInTheDocument();
    });
  });

  describe('role visibility', () => {
    const openAdvancedTab = async(user) => {
      await screen.findByRole('textbox', { name: /^name/i });
      await user.click(screen.getByRole('tab', { name: 'Advanced' }));
      await screen.findByRole('textbox', { name: /^request/i });
    };

    it('submits the IDs of the selected roles', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', { results: [{ id: '99' }] });

      renderWithRedux(<AbForm {...defaultProps} />);
      await screen.findByRole('textbox', { name: /^name/i });
      await user.type(nameField(), 'Role Button');
      await user.type(descriptionField(), 'desc');
      await user.click(screen.getByRole('tab', { name: 'Advanced' }));
      await user.type(await screen.findByRole('textbox', { name: /^request/i }), 'my_request');

      await user.selectOptions(screen.getByLabelText('Role Access'), 'role');
      await user.click(await screen.findByRole('combobox', { name: /user roles/i }));
      await user.click(await screen.findByText('EvmRole-auditor'));
      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => expect(fetchMock.callHistory.calls('/api/custom_buttons/')).toHaveLength(1));
      const { options: opts } = fetchMock.callHistory.calls('/api/custom_buttons/')[0];
      expect(JSON.parse(opts.body).visibility).toEqual({ roles: ['2'] });
    });

    it('does not allow submitting By Role with no roles selected', async() => {
      const user = userEvent.setup();

      renderWithRedux(<AbForm {...defaultProps} />);
      await user.type(await screen.findByRole('textbox', { name: /^name/i }), 'Role Button');
      await user.type(descriptionField(), 'desc');
      await user.click(screen.getByRole('tab', { name: 'Advanced' }));
      await user.type(await screen.findByRole('textbox', { name: /^request/i }), 'my_request');

      await user.selectOptions(screen.getByLabelText('Role Access'), 'role');

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    });

    it('preselects stored role IDs on edit and resubmits them unchanged', async() => {
      const user = userEvent.setup();
      getInitialValues.mockResolvedValue({
        ...editValues,
        visibility: { roles: 'role' },
        available_roles: ['2'],
      });
      fetchMock.put('/api/custom_buttons/5', { id: '5', name: 'My Button' });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await openAdvancedTab(user);

      // The multi-select only shows a count tag, so open the menu and check which option is selected.
      await user.click(await screen.findByRole('combobox', { name: /user roles/i }));
      expect(await screen.findByRole('option', { name: 'EvmRole-auditor' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('option', { name: 'EvmRole-administrator' })).toHaveAttribute('aria-selected', 'false');

      await user.click(screen.getByRole('tab', { name: 'Options' }));
      await user.clear(descriptionField());
      await user.type(descriptionField(), 'Changed');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(fetchMock.callHistory.calls('/api/custom_buttons/5')).toHaveLength(1));
      const { options: opts } = fetchMock.callHistory.calls('/api/custom_buttons/5')[0];
      expect(JSON.parse(opts.body).visibility).toEqual({ roles: ['2'] });
    });
  });

  describe('Open URL and dialog restrictions', () => {
    it('disables Open URL for a class that cannot open URLs', async() => {
      renderWithRedux(<AbForm {...defaultProps} appliesToClass="AvailabilityZone" />);

      expect(await screen.findByRole('checkbox', { name: 'Open URL' })).toBeDisabled();
    });

    it('enables Open URL for a supported class with display_for single', async() => {
      renderWithRedux(<AbForm {...defaultProps} appliesToClass="Vm" />);

      expect(await screen.findByRole('checkbox', { name: 'Open URL' })).toBeEnabled();
    });

    it('disables Open URL once display_for is no longer single', async() => {
      const user = userEvent.setup();
      renderWithRedux(<AbForm {...defaultProps} appliesToClass="Vm" />);
      await screen.findByRole('checkbox', { name: 'Open URL' });

      await user.selectOptions(screen.getByLabelText('Display for'), 'list');

      expect(screen.getByRole('checkbox', { name: 'Open URL' })).toBeDisabled();
    });

    it('does not submit a stale dialog or Open URL after switching display_for to list', async() => {
      const user = userEvent.setup();
      getInitialValues.mockResolvedValue({
        ...editValues,
        options: { ...editValues.options, open_url: true },
        resource_action: { ...editValues.resource_action, dialog_id: 1 },
      });
      fetchMock.put('/api/custom_buttons/5', { id: '5', name: 'My Button' });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await screen.findByDisplayValue('My Button');
      await user.selectOptions(screen.getByLabelText('Display for'), 'list');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(fetchMock.callHistory.calls('/api/custom_buttons/5')).toHaveLength(1));
      const body = JSON.parse(fetchMock.callHistory.calls('/api/custom_buttons/5')[0].options.body);
      expect(body.options.open_url).toBe(false);
      expect(body.resource_action.dialog_id).toBeNull();
    });
  });

  describe('ansible playbook button (edit round trip)', () => {
    it('loads and resubmits an ansible button with the playbook, hosts and request set correctly', async() => {
      const user = userEvent.setup();
      getButtonFormData.mockResolvedValue({
        distinct_instances: [],
        ansible_playbooks: [{ value: 'my_playbook', label: 'my_playbook' }],
      });
      getInitialValues.mockResolvedValue({
        ...editValues,
        options: { ...editValues.options, button_type: 'ansible_playbook' },
        uri_attributes: { request: 'create', service_template_name: 'my_playbook' },
        inventory_type: 'manual',
        hosts: '10.0.0.1',
      });
      fetchMock.put('/api/custom_buttons/5', { id: '5', name: 'My Button' });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await screen.findByDisplayValue('My Button');
      expect(await screen.findByDisplayValue('10.0.0.1')).toBeInTheDocument();

      await user.clear(descriptionField());
      await user.type(descriptionField(), 'Changed');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(fetchMock.callHistory.calls('/api/custom_buttons/5')).toHaveLength(1));
      const body = JSON.parse(fetchMock.callHistory.calls('/api/custom_buttons/5')[0].options.body);
      expect(body.uri_attributes).toEqual({
        request: 'Order_Ansible_Playbook',
        service_template_name: 'my_playbook',
        hosts: '10.0.0.1',
      });
      expect(body.inventory_type).toBeUndefined();
      expect(body.hosts).toBeUndefined();
    });
  });

  describe('attribute pairs', () => {
    it('deleting an attribute pair drops it from the saved uri_attributes', async() => {
      const user = userEvent.setup();
      getInitialValues.mockResolvedValue({
        ...editValues,
        uri_attributes: { request: 'create', env: 'prod', tier: 'web' },
        attribute_pairs: [
          { key: 'env', value: 'prod' },
          { key: 'tier', value: 'web' },
        ],
      });
      fetchMock.put('/api/custom_buttons/5', { id: '5', name: 'My Button' });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await screen.findByDisplayValue('My Button');

      await user.click(screen.getByRole('tab', { name: 'Advanced' }));
      await screen.findByDisplayValue('env');

      const deleteButtons = screen.getAllByRole('button', { name: /delete key-value pair/i });
      await user.click(deleteButtons[0]);

      expect(screen.queryByDisplayValue('env')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('tier')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => expect(fetchMock.callHistory.calls('/api/custom_buttons/5')).toHaveLength(1));
      const body = JSON.parse(fetchMock.callHistory.calls('/api/custom_buttons/5')[0].options.body);
      expect(body.uri_attributes).toEqual({
        request: 'create',
        tier: 'web',
      });
    });
  });

  describe('new button under a button group (customButtonGroupId)', () => {
    it('POSTs the button then assigns it to the group', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', { results: [{ id: '77' }] });
      fetchMock.post('/api/custom_button_sets/10', {});

      renderWithRedux(<AbForm {...defaultProps} customButtonGroupId={10} />);
      await submitNewButton(user, { name: 'Group Button', description: 'desc' });

      await waitFor(() => {
        expect(fetchMock.callHistory.calls('/api/custom_button_sets/10')).toHaveLength(1);
        const { options: opts } = fetchMock.callHistory.calls('/api/custom_button_sets/10')[0];
        expect(JSON.parse(opts.body)).toMatchObject({ action: 'add_custom_button', button_id: 77 });
        expect(miqRedirectBack).toHaveBeenCalled();
      });
    });

    it('redirects with a warning and skips assignment when the response has no id', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', { results: [{}] });

      renderWithRedux(<AbForm {...defaultProps} customButtonGroupId={10} />);
      await submitNewButton(user, { name: 'Group Button', description: 'desc' });

      await waitFor(() => {
        expect(miqRedirectBack).toHaveBeenCalledWith(
          'Custom Button was saved but could not be assigned. Please assign it manually.',
          'warning',
          expect.any(String),
        );
      });
      expect(fetchMock.callHistory.calls('/api/custom_button_sets/10')).toHaveLength(0);
    });
  });

  describe('new button under a service template (appliesToId)', () => {
    it('POSTs the button then assigns it to the service template', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', { results: [{ id: '88' }] });
      fetchMock.post('/api/service_templates/42', {});

      renderWithRedux(<AbForm {...defaultProps} appliesToId="42" />);
      await submitNewButton(user, { name: 'ST Button', description: 'desc' });

      await waitFor(() => {
        expect(fetchMock.callHistory.calls('/api/service_templates/42')).toHaveLength(1);
        const { options: opts } = fetchMock.callHistory.calls('/api/service_templates/42')[0];
        expect(JSON.parse(opts.body)).toMatchObject({ action: 'add_custom_button', button_id: 88 });
        expect(miqRedirectBack).toHaveBeenCalled();
      });
    });

    it('redirects with a warning and skips assignment when the response has no id', async() => {
      const user = userEvent.setup();
      fetchMock.post('/api/custom_buttons/', { results: [{}] });

      renderWithRedux(<AbForm {...defaultProps} appliesToId="42" />);
      await submitNewButton(user, { name: 'ST Button', description: 'desc' });

      await waitFor(() => {
        expect(miqRedirectBack).toHaveBeenCalledWith(
          'Custom Button was saved but could not be assigned. Please assign it manually.',
          'warning',
          expect.any(String),
        );
      });
      expect(fetchMock.callHistory.calls('/api/service_templates/42')).toHaveLength(0);
    });
  });
});
