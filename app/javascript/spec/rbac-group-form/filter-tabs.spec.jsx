import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterTabs from '../../components/rbac-group-form/filter-tabs';

const mockOnChange = jest.fn();

jest.mock('@@ddf', () => ({
  useFieldApi: (props) => ({
    meta: {},
    input: {
      value: props.initialValue || {},
      onChange: mockOnChange,
    },
  }),
}));

// BelongsToTab uses react-checkbox-tree which is fine in jsdom,
// but ExpressionEditor (inside CustomerTagsTab) makes API calls — mock it.
jest.mock('../../components/expression-editor', () => {
  const MockExpressionEditor = ({ onQueryChange }) => (
    <div data-testid="expression-editor">
      <button type="button" onClick={() => onQueryChange({ rules: [] }, [])}>trigger valid</button>
      <button type="button" onClick={() => onQueryChange({ rules: [] }, ['err'])}>trigger error</button>
    </div>
  );
  return MockExpressionEditor;
});

const emptyTags = { tags: [], assignedTags: [], affectedItems: [] };
const noop = () => {};

const defaultProps = {
  tags: emptyTags,
  hacTree: '[]',
  vatTree: '[]',
  currentTenantName: 'My Company',
  readOnly: false,
  superAdminUser: true,
};

describe('FilterTabs', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders "Assign Filters" heading in edit mode', () => {
    render(<FilterTabs {...defaultProps} />);
    expect(screen.getByText('Assign Filters')).toBeInTheDocument();
  });

  it('renders "Assigned Filters (read only)" heading in read-only mode', () => {
    render(<FilterTabs {...defaultProps} readOnly />);
    expect(screen.getByText('Assigned Filters (read only)')).toBeInTheDocument();
  });

  it('renders the three tab labels with currentTenantName', () => {
    render(<FilterTabs {...defaultProps} currentTenantName="Acme Corp" />);
    expect(screen.getByText('Acme Corp Tags')).toBeInTheDocument();
    expect(screen.getByText('Clusters, Datastores, Hosts, Managers & Providers')).toBeInTheDocument();
    expect(screen.getByText('VMs & Templates')).toBeInTheDocument();
  });

  it('falls back to "My Company" when currentTenantName is not provided', () => {
    render(<FilterTabs {...defaultProps} currentTenantName={undefined} />);
    expect(screen.getByText('My Company Tags')).toBeInTheDocument();
  });

  it('calls onChange with useFilterExpression:true when toggling to expression mode', async() => {
    const user = userEvent.setup();
    render(<FilterTabs {...defaultProps} />);

    // The mode select is rendered by CustomerTagsTab on the first tab (active by default)
    const select = screen.getByRole('combobox', { name: /this user is limited to/i });
    await user.selectOptions(select, 'expression');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ useFilterExpression: true, assignedTags: [], filterExpression: null })
    );
  });

  it('calls onChange with useFilterExpression:false when toggling back to tags mode', async() => {
    const user = userEvent.setup();
    // Start in expression mode by seeding the field value
    jest.spyOn(require('@@ddf'), 'useFieldApi').mockReturnValueOnce({
      meta: {},
      input: { value: { useFilterExpression: true }, onChange: mockOnChange },
    });

    render(<FilterTabs {...defaultProps} />);

    const select = screen.getByRole('combobox', { name: /this user is limited to/i });
    await user.selectOptions(select, 'tags');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ useFilterExpression: false, filterExpression: null })
    );
  });
});
