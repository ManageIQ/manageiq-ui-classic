import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRedux } from '../helpers/mountForm';
import ConditionForm from '../../components/condition-form';
import miqRedirectBack from '../../helpers/miq-redirect-back';
import { API } from '../../http_api';

jest.mock('../../helpers/miq-redirect-back', () => jest.fn());
jest.mock('../../http_api', () => ({
  API: { get: jest.fn(), post: jest.fn() },
}));

// Stub ExpressionEditor. Accepts an optional `simulateValue` prop so
// individual tests can push a value into the DDF field via onQueryChange.
jest.mock('../../components/expression-editor', () => ({
  __esModule: true,
  default: ({ onQueryChange, simulateValue }) => {
    if (simulateValue !== undefined && onQueryChange) {
      onQueryChange(simulateValue, []);
    }
    return <div data-testid="expression-editor" />;
  },
}));

const TOWHAT_OPTIONS = [
  ['Virtual Machine', 'Vm'],
  ['Host', 'Host'],
];

describe('ConditionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.add_flash = jest.fn();
  });

  describe('add mode', () => {
    it('renders without fetching', () => {
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} />);
      expect(API.get).not.toHaveBeenCalled();
    });

    it('shows Add button and Cancel button', () => {
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} />);
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not show Reset button', () => {
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} />);
      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
    });

    it('redirects with warning on cancel', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} />);

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Add of new Condition was cancelled by the user',
        'warning',
        '/condition/show_list',
      );
    });
  });

  describe('edit mode', () => {
    const recordData = {
      description: 'Existing Condition',
      towhat: 'Vm',
      notes: 'Some notes',
      expression: { exp: { '=': { field: 'Vm-name', value: 'test' } } },
      applies_to_exp: null,
    };

    it('shows loading spinner while fetching', () => {
      API.get.mockReturnValue(new Promise(() => {}));
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);
      expect(document.querySelector('.cds--loading')).toBeInTheDocument();
    });

    it('fetches the correct API URL', () => {
      API.get.mockReturnValue(new Promise(() => {}));
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);
      expect(API.get).toHaveBeenCalledWith(
        '/api/conditions/5?attributes=expression,applies_to_exp,towhat,description,notes,read_only',
      );
    });

    it('populates form with fetched values', async() => {
      API.get.mockResolvedValue(recordData);
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Condition')).toBeInTheDocument();
      });
      expect(screen.getByDisplayValue('Some notes')).toBeInTheDocument();
    });

    it('shows Save button (not Add) and Reset button', async() => {
      API.get.mockResolvedValue(recordData);
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('redirects with description on cancel', async() => {
      const user = userEvent.setup();
      API.get.mockResolvedValue(recordData);
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);

      await waitFor(() => screen.getByRole('button', { name: /cancel/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Edit of Condition "Existing Condition" was cancelled by the user',
        'warning',
        '/condition/show_list',
      );
    });

    it('calls add_flash on fetch error with message', async() => {
      API.get.mockRejectedValue({ data: { message: 'Not found' } });
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);

      await waitFor(() => {
        expect(window.add_flash).toHaveBeenCalledWith('Not found', 'error');
      });
    });

    it('calls add_flash on fetch error without message', async() => {
      API.get.mockRejectedValue('boom');
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);

      await waitFor(() => {
        expect(window.add_flash).toHaveBeenCalledWith('boom', 'error');
      });
    });

    it('POSTs edit payload and redirects on save', async() => {
      const user = userEvent.setup();
      API.get.mockResolvedValue(recordData);
      API.post.mockResolvedValue({ id: '5' });

      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="5" />);
      await waitFor(() => screen.getByRole('button', { name: 'Save' }));

      const desc = screen.getByRole('textbox', { name: /description/i });
      await user.clear(desc);
      await user.type(desc, 'Updated Condition');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(API.post).toHaveBeenCalledWith(
          '/api/conditions/5',
          expect.objectContaining({
            action: 'edit',
            resource: expect.objectContaining({ description: 'Updated Condition' }),
          }),
        );
      });

      expect(miqRedirectBack).toHaveBeenCalledWith(
        'Condition "Updated Condition" was saved',
        'success',
        '/condition/show/5',
      );
    });
  });

  describe('copy mode', () => {
    const copyData = {
      description: 'Original',
      towhat: 'Vm',
      notes: '',
      expression: { exp: { '=': { field: 'Vm-name', value: 'x' } } },
      applies_to_exp: null,
    };

    it('shows Add button (not Save) and no Reset button', async() => {
      API.get.mockResolvedValue(copyData);
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} recordId="3" isCopy />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
      });
      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
    });
  });

  describe('validate', () => {
    it('blocks submit and shows required message when expression is missing', async() => {
      const user = userEvent.setup();
      renderWithRedux(<ConditionForm towhatOptions={TOWHAT_OPTIONS} />);

      await user.type(screen.getByRole('textbox', { name: /description/i }), 'Test');
      await user.selectOptions(document.getElementById('towhat'), 'Vm');

      // Expression is null (stub never calls onQueryChange) — Add is disabled.
      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

      // The info message tells the user what is needed.
      expect(screen.getByText('A condition must contain a valid expression.')).toBeInTheDocument();
    });
  });
});
