import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterTabs from '../../components/rbac-group-form/filter-tabs';

const mockOnChange = jest.fn();

const fieldState = { value: {} };
jest.mock('@@ddf', () => ({
  useFieldApi: (props) => ({
    meta: {},
    input: {
      value: props.initialValue !== undefined ? props.initialValue : fieldState.value,
      onChange: mockOnChange,
    },
  }),
}));

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
    fieldState.value = {};
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

    const select = screen.getByRole('combobox', { name: /this user is limited to/i });
    await user.selectOptions(select, 'expression');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ useFilterExpression: true, assignedTags: [], filterExpression: null })
    );
  });

  it('calls onChange with useFilterExpression:false when toggling back to tags mode', async() => {
    const user = userEvent.setup();
    fieldState.value = { useFilterExpression: true };

    render(<FilterTabs {...defaultProps} />);

    const select = screen.getByRole('combobox', { name: /this user is limited to/i });
    await user.selectOptions(select, 'tags');

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ useFilterExpression: false, filterExpression: null })
    );
  });

  it('wires hacChecked updates from BelongsToTab through onChange', async() => {
    const bsTree = JSON.stringify([{ key: 'node-1', text: 'Provider A', nodes: [] }]);
    const user = userEvent.setup();
    fieldState.value = { hacChecked: [] };

    render(
      <FilterTabs
        {...defaultProps}
        hacTree={bsTree}
      />
    );

    await user.click(screen.getByRole('tab', { name: /clusters/i }));

    await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ hacChecked: ['node-1'] })
    );
  });
});
