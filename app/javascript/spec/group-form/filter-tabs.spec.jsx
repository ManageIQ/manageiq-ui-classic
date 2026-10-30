import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterTabs from '../../components/group-form/filter-tabs';

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

// A provider key that appears in both path maps (shared root node).
const SHARED_KEY = 'e-1';
// A key that is only in hacPaths.
const HAC_ONLY_KEY = 'cluster-a';
// A key that is only in vatPaths.
const VAT_ONLY_KEY = 'web-tier';

const hacTree = JSON.stringify([{
  key: SHARED_KEY,
  text: 'Seed Provider',
  nodes: [{ key: HAC_ONLY_KEY, text: 'Cluster A', nodes: [] }],
}]);

const vatTree = JSON.stringify([{
  key: SHARED_KEY,
  text: 'Seed Provider',
  hideCheckbox: true,
  nodes: [{ key: VAT_ONLY_KEY, text: 'Web Tier', nodes: [] }],
}]);

const hacPaths = {
  [SHARED_KEY]: '/belongsto/ExtManagementSystem|Seed Provider',
  [HAC_ONLY_KEY]: '/belongsto/ExtManagementSystem|Seed Provider/EmsCluster|Cluster A',
};

const vatPaths = {
  [SHARED_KEY]: '/belongsto/ExtManagementSystem|Seed Provider',
  [VAT_ONLY_KEY]: '/belongsto/ExtManagementSystem|Seed Provider/EmsFolder|vm/EmsFolder|Web Tier',
};

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

  it('wires belongstoChecked updates from BelongsToTab through onChange', async() => {
    const bsTree = JSON.stringify([{ key: 'node-1', text: 'Provider A', nodes: [] }]);
    const user = userEvent.setup();
    fieldState.value = { belongstoChecked: [] };

    render(
      <FilterTabs
        {...defaultProps}
        hacTree={bsTree}
      />
    );

    await user.click(screen.getByRole('tab', { name: /clusters/i }));

    await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ belongstoChecked: ['node-1'] })
    );
  });
  describe('HAC / VAT tab isolation', () => {
    it('Select All on HAC does not add VAT-exclusive keys to belongstoChecked', async() => {
      const user = userEvent.setup();
      fieldState.value = { belongstoChecked: [] };

      render(
        <FilterTabs
          {...defaultProps}
          hacTree={hacTree}
          vatTree={vatTree}
          hacPaths={hacPaths}
          vatPaths={vatPaths}
        />
      );

      await user.click(screen.getByRole('tab', { name: /clusters/i }));
      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      const called = mockOnChange.mock.calls[0][0].belongstoChecked;
      expect(called).not.toContain(VAT_ONLY_KEY);
    });

    it('Select All on VAT does not add HAC-exclusive keys to belongstoChecked', async() => {
      const user = userEvent.setup();
      fieldState.value = { belongstoChecked: [] };

      render(
        <FilterTabs
          {...defaultProps}
          hacTree={hacTree}
          vatTree={vatTree}
          hacPaths={hacPaths}
          vatPaths={vatPaths}
        />
      );

      await user.click(screen.getByRole('tab', { name: /vms/i }));
      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      const called = mockOnChange.mock.calls[0][0].belongstoChecked;
      expect(called).not.toContain(HAC_ONLY_KEY);
    });

    it('checking a node on HAC preserves existing VAT-exclusive checked keys', async() => {
      const user = userEvent.setup();
      // VAT-only key already checked
      fieldState.value = { belongstoChecked: [VAT_ONLY_KEY] };

      render(
        <FilterTabs
          {...defaultProps}
          hacTree={hacTree}
          vatTree={vatTree}
          hacPaths={hacPaths}
          vatPaths={vatPaths}
        />
      );

      await user.click(screen.getByRole('tab', { name: /clusters/i }));
      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      const called = mockOnChange.mock.calls[0][0].belongstoChecked;
      expect(called).toContain(VAT_ONLY_KEY);
    });

    it('checking a node on VAT preserves existing HAC-exclusive checked keys', async() => {
      const user = userEvent.setup();
      // HAC-only key already checked
      fieldState.value = { belongstoChecked: [HAC_ONLY_KEY] };

      render(
        <FilterTabs
          {...defaultProps}
          hacTree={hacTree}
          vatTree={vatTree}
          hacPaths={hacPaths}
          vatPaths={vatPaths}
        />
      );

      await user.click(screen.getByRole('tab', { name: /vms/i }));
      await user.click(screen.getAllByRole('button', { name: /select all/i })[0]);

      const called = mockOnChange.mock.calls[0][0].belongstoChecked;
      expect(called).toContain(HAC_ONLY_KEY);
    });

    it('shared keys (provider root) are owned by HAC and not shown as checked in VAT', () => {
      // A shared key checked via HAC should not appear in VAT's checked prop
      fieldState.value = { belongstoChecked: [SHARED_KEY, HAC_ONLY_KEY] };

      render(
        <FilterTabs
          {...defaultProps}
          hacTree={hacTree}
          vatTree={vatTree}
          hacPaths={hacPaths}
          vatPaths={vatPaths}
        />
      );

      // The VAT BelongsToTab should receive only VAT-exclusive keys as checked,
      // not the shared provider key
      const vatCheckboxes = screen.queryAllByRole('checkbox');
      // Web Tier should not be checked (SHARED_KEY is not VAT_ONLY_KEY)
      const webTierCheckbox = vatCheckboxes.find(
        (cb) => cb.closest('li')?.textContent?.includes('Web Tier')
      );
      expect(webTierCheckbox?.checked).toBeFalsy();
    });
  });
});
