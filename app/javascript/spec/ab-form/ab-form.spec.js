import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import { renderWithRedux } from '../helpers/mountForm';
import AbForm from '../../components/ab-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());

// Mock the whole helper so tests don't need to set up window.http or
// run real network calls for roles/dialogs/formData on every test.
// Individual tests can override specific functions via mockResolvedValue.
jest.mock('../../components/ab-form/helper', () => ({
  getRoles: jest.fn(),
  getServiceDialogs: jest.fn(),
  getButtonFormData: jest.fn(),
  getInitialValues: jest.fn(),
  getButtonTypes: jest.fn(),
  buildSubmitData: jest.requireActual('../../components/ab-form/helper').buildSubmitData,
}));

// Stub custom DDF fields that are heavy or have their own tests
jest.mock('../../components/fonticon-picker/font-icon-picker-ddf', () => ({
  __esModule: true,
  default: () => <div data-testid="font-icon-picker" />,
}));
jest.mock('../../components/key-value-list', () => ({
  __esModule: true,
  default: () => <div data-testid="key-value-list" />,
}));
jest.mock('../../components/condition-form/expression-editor-field', () => ({
  __esModule: true,
  default: () => <div data-testid="expression-editor" />,
}));

import {
  getRoles, getServiceDialogs, getButtonFormData, getInitialValues, getButtonTypes,
} from '../../components/ab-form/helper';

// ── shared fixtures ──────────────────────────────────────────────────────────

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
  uri_attributes: { request: 'create' },
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

// ── setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  getRoles.mockResolvedValue([{ label: 'EvmRole-administrator', value: 'EvmRole-administrator' }]);
  getServiceDialogs.mockResolvedValue([{ label: 'My Dialog', value: 1 }]);
  getButtonFormData.mockResolvedValue({ distinct_instances: [], ansible_playbooks: [] });
  getInitialValues.mockResolvedValue(newDefaults);
  getButtonTypes.mockResolvedValue([
    { value: 'default', label: 'Default' },
    { value: 'ansible_playbook', label: 'Ansible Playbook' },
  ]);
});

afterEach(() => {
  fetchMock.restore();
  jest.clearAllMocks();
});

// ── tests ────────────────────────────────────────────────────────────────────

describe('AbForm', () => {
  describe('new button', () => {
    it('shows a loading spinner while data is fetched', () => {
      // Never resolve so we stay in loading state
      getInitialValues.mockReturnValue(new Promise(() => {}));
      renderWithRedux(<AbForm {...defaultProps} />);
      expect(document.querySelector('.cds--loading')).toBeInTheDocument();
    });

    it('renders the Options tab fields after loading', async() => {
      renderWithRedux(<AbForm {...defaultProps} />);

      await waitFor(() => expect(document.getElementById('name')).toBeInTheDocument());
      expect(document.getElementById('description')).toBeInTheDocument();
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
      fetchMock.postOnce('/api/custom_buttons/', { results: [{ id: '99' }] });

      renderWithRedux(<AbForm {...defaultProps} />);
      await waitFor(() => expect(document.getElementById('name')).toBeInTheDocument());

      await user.type(document.getElementById('name'), 'Test Button');
      await user.type(document.getElementById('description'), 'A test button');

      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(fetchMock.calls('/api/custom_buttons/').length).toBe(1);
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.stringContaining('Test Button'),
          'success',
          '/miq_ae_customization/explorer',
        );
      });
    });

    it('shows an inline error notification on submit failure', async() => {
      const user = userEvent.setup();
      fetchMock.postOnce('/api/custom_buttons/', { throws: { data: { error: { message: 'Validation failed' } } } });

      renderWithRedux(<AbForm {...defaultProps} />);
      await waitFor(() => expect(document.getElementById('name')).toBeInTheDocument());

      await user.type(document.getElementById('name'), 'Bad Button');
      await user.type(document.getElementById('description'), 'desc');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(document.querySelector('.cds--inline-notification--error')).toBeInTheDocument();
        expect(document.querySelector('.cds--inline-notification--error')).toHaveTextContent('Validation failed');
      });
    });
  });

  describe('edit button (recId present)', () => {
    beforeEach(() => {
      getInitialValues.mockResolvedValue(editValues);
    });

    it('shows a loading spinner while data is fetched', () => {
      getInitialValues.mockReturnValue(new Promise(() => {}));
      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      expect(document.querySelector('.cds--loading')).toBeInTheDocument();
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
      fetchMock.putOnce('/api/custom_buttons/5', { id: '5', name: 'My Button' });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await waitFor(() => expect(screen.getByDisplayValue('My Button')).toBeInTheDocument());

      // Change a field to make the form dirty
      await user.clear(document.getElementById('description'));
      await user.type(document.getElementById('description'), 'Updated description');

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(fetchMock.calls('/api/custom_buttons/5').length).toBe(1);
        expect(miqRedirectBack).toHaveBeenCalledWith(
          expect.stringContaining('My Button'),
          'success',
          '/miq_ae_customization/explorer',
        );
      });
    });

    it('shows an inline error on save failure and allows dismissal', async() => {
      const user = userEvent.setup();
      fetchMock.putOnce('/api/custom_buttons/5', { throws: { data: { error: { message: 'Save failed' } } } });

      renderWithRedux(<AbForm {...defaultProps} recId={5} />);
      await waitFor(() => expect(screen.getByDisplayValue('My Button')).toBeInTheDocument());

      await user.clear(document.getElementById('description'));
      await user.type(document.getElementById('description'), 'Changed');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(document.querySelector('.cds--inline-notification--error')).toBeInTheDocument();
        expect(document.querySelector('.cds--inline-notification--error')).toHaveTextContent('Save failed');
      });

      // Dismiss the notification
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(document.querySelector('.cds--inline-notification--error')).not.toBeInTheDocument();
    });
  });

  describe('new button under a button group (customButtonGroupId)', () => {
    it('POSTs the button then assigns it to the group', async() => {
      const user = userEvent.setup();
      fetchMock.postOnce('/api/custom_buttons/', { results: [{ id: '77' }] });
      fetchMock.postOnce('/api/custom_button_sets/10', {});

      renderWithRedux(<AbForm {...defaultProps} customButtonGroupId={10} />);
      await waitFor(() => expect(document.getElementById('name')).toBeInTheDocument());

      await user.type(document.getElementById('name'), 'Group Button');
      await user.type(document.getElementById('description'), 'desc');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(fetchMock.calls('/api/custom_button_sets/10').length).toBe(1);
        const [, opts] = fetchMock.calls('/api/custom_button_sets/10')[0];
        expect(JSON.parse(opts.body)).toMatchObject({ action: 'assign_custom_button', button_id: 77 });
        expect(miqRedirectBack).toHaveBeenCalled();
      });
    });
  });

  describe('new button under a service template (appliesToId)', () => {
    it('POSTs the button then assigns it to the service template', async() => {
      const user = userEvent.setup();
      fetchMock.postOnce('/api/custom_buttons/', { results: [{ id: '88' }] });
      fetchMock.postOnce('/api/service_templates/42', {});

      renderWithRedux(<AbForm {...defaultProps} appliesToId="42" />);
      await waitFor(() => expect(document.getElementById('name')).toBeInTheDocument());

      await user.type(document.getElementById('name'), 'ST Button');
      await user.type(document.getElementById('description'), 'desc');
      await user.click(screen.getByRole('button', { name: 'Add' }));

      await waitFor(() => {
        expect(fetchMock.calls('/api/service_templates/42').length).toBe(1);
        const [, opts] = fetchMock.calls('/api/service_templates/42')[0];
        expect(JSON.parse(opts.body)).toMatchObject({ action: 'assign_custom_button', button_id: 88 });
        expect(miqRedirectBack).toHaveBeenCalled();
      });
    });
  });
});
