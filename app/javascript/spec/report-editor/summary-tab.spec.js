import { screen, waitFor, fireEvent } from '@testing-library/react';
import {
  makeFormData as makeBaseFormData, renderAndOpenTab, resetFetchMock,
} from '../helpers/reportEditor';

const makeFormData = ({ report, ...rest } = {}) => makeBaseFormData({
  report: {
    col_order: ['Vm-name', 'Vm-num_cpu'],
    headers: ['Name', 'CPUs'],
    col_formats: ['', ''],
    col_options: {
      'Vm-name': { header: 'Name', format: '' },
      'Vm-num_cpu': { header: 'CPUs', format: '' },
    },
    sortby: [],
    order: 'Ascending',
    group: 'No',
    hide_details: false,
    row_limit: null,
    ...report,
  },
  models: [['Virtual Machines', 'Vm']],
  field_metadata: {
    'Vm-name': { numeric: false, break_suffixes: [], available_formats: [] },
    'Vm-num_cpu': { numeric: true, break_suffixes: [], available_formats: [] },
  },
  ...rest,
});

const openSummary = (formData = makeFormData()) => renderAndOpenTab('Summary', { formData });

describe('SummaryTab (via ReportEditor)', () => {
  afterEach(resetFetchMock);

  it('shows "Add columns first" prompt when no columns are selected', async() => {
    await openSummary(makeFormData({
      report: {
        ...makeFormData().report,
        col_order: [],
        col_options: {},
        headers: [],
        col_formats: [],
      },
    }));
    // Use specific text to disambiguate from the Styling/Preview tab messages
    expect(screen.getByText('Add columns on the Columns tab to configure summary options.')).toBeInTheDocument();
  });

  it('shows Sort Criteria section when columns are present', async() => {
    await openSummary();
    expect(screen.getByText('Sort Criteria')).toBeInTheDocument();
  });

  it('renders a sort-by select with column options', async() => {
    await openSummary();
    expect(document.getElementById('summary-sort-1')).toBeInTheDocument();
  });

  it('shows Sort Order select after selecting a primary sort column', async() => {
    await openSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-order')).toBeInTheDocument());
  });

  it('shows Show Sort Breaks select after selecting a primary sort', async() => {
    await openSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-group')).toBeInTheDocument());
  });

  it('shows secondary sort select after selecting a primary sort', async() => {
    await openSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-sort-2')).toBeInTheDocument());
  });

  it('shows Number of Rows select (row_limit) when breaks are off', async() => {
    await openSummary();
    const sortSelect = document.getElementById('summary-sort-1');
    fireEvent.change(sortSelect, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-row-limit')).toBeInTheDocument());
  });

  it('shows Hide Detail Rows toggle when group breaks are on', async() => {
    // Initialise col_options with grouping as arrays to avoid normalizeSelected crash
    await openSummary(makeFormData({
      report: {
        ...makeFormData().report,
        sortby: ['Vm-name'],
        group: 'Yes',
        col_options: {
          'Vm-name': { header: 'Name', format: '', grouping: [] },
          'Vm-num_cpu': { header: 'CPUs', format: '', grouping: [] },
        },
      },
    }));
    await waitFor(() => expect(document.getElementById('summary-hide-details')).toBeInTheDocument());
  });

  it('shows Break Calculations table when group is Yes and sort is set', async() => {
    await openSummary(makeFormData({
      report: {
        ...makeFormData().report,
        sortby: ['Vm-name'],
        group: 'Yes',
        col_options: {
          'Vm-name': { header: 'Name', format: '', grouping: [] },
          'Vm-num_cpu': { header: 'CPUs', format: '', grouping: [] },
        },
      },
      field_metadata: {
        'Vm-name': { numeric: false },
        'Vm-num_cpu': { numeric: true },
      },
    }));
    await waitFor(() => expect(screen.getByText('Break Calculations')).toBeInTheDocument());
  });

  it('shows Consolidation accordion section', async() => {
    await openSummary();
    expect(screen.getByText('Group Records (Consolidation)')).toBeInTheDocument();
  });

  it('shows pivot column selects inside Consolidation accordion', async() => {
    await openSummary();
    expect(document.getElementById('summary-pivot-1')).toBeInTheDocument();
  });

  it('shows Group by Column 2 after selecting pivot column 1', async() => {
    await openSummary();
    const pivot1 = document.getElementById('summary-pivot-1');
    fireEvent.change(pivot1, { target: { value: 'Vm-name' } });
    await waitFor(() => expect(document.getElementById('summary-pivot-2')).toBeInTheDocument());
  });

  describe('sorting', () => {
    const metadata = {
      'Vm-name': {
        numeric: false,
        break_suffixes: [['Day', 'day'], ['Month', 'month']],
        available_formats: [['Short', 'short'], ['Long', 'long']],
      },
      'Vm-num_cpu': { numeric: true, break_suffixes: [['Hour', 'hour']], available_formats: [] },
    };
    const sorted = (report = {}) => makeFormData({
      report: { ...makeFormData().report, sortby: ['Vm-name'], ...report },
      field_metadata: metadata,
    });
    const change = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });
    const values = (id) => Array.from(document.getElementById(id).options).map((option) => option.value);

    it('lists Nothing and every selected column as a sort choice', async() => {
      await openSummary();
      expect(values('summary-sort-1')).toEqual(['<<<Nothing>>>', 'Vm-name', 'Vm-num_cpu']);
    });

    it('leaves the primary sort column out of the secondary sort choices', async() => {
      await openSummary(sorted());
      expect(values('summary-sort-2')).toEqual(['<<<Nothing>>>', 'Vm-num_cpu']);
    });

    it('offers the break suffixes of the primary sort column', async() => {
      await openSummary(sorted());
      expect(values('summary-sort-1-suffix')).toEqual(['', 'day', 'month']);

      change('summary-sort-1-suffix', 'month');
      await waitFor(() => expect(document.getElementById('summary-sort-1-suffix')).toHaveValue('month'));
    });

    it('does not offer a suffix select for a column without break suffixes', async() => {
      await openSummary(makeFormData({ report: { ...makeFormData().report, sortby: ['Vm-name'] } }));

      expect(document.getElementById('summary-sort-1')).toHaveValue('Vm-name');
      expect(document.getElementById('summary-sort-1-suffix')).not.toBeInTheDocument();
    });

    it('offers the break suffixes of the secondary sort column once it is chosen', async() => {
      await openSummary(sorted());
      expect(document.getElementById('summary-sort-2-suffix')).not.toBeInTheDocument();

      change('summary-sort-2', 'Vm-num_cpu');

      await waitFor(() => expect(document.getElementById('summary-sort-2-suffix')).toBeInTheDocument());
      expect(values('summary-sort-2-suffix')).toEqual(['', 'hour']);
      change('summary-sort-2-suffix', 'hour');
      await waitFor(() => expect(document.getElementById('summary-sort-2-suffix')).toHaveValue('hour'));
    });

    it('changes the sort order', async() => {
      await openSummary(sorted());

      change('summary-order', 'Descending');

      await waitFor(() => expect(document.getElementById('summary-order')).toHaveValue('Descending'));
    });

    it('clears the secondary sort and the sort breaks when the primary sort is set to Nothing', async() => {
      await openSummary(sorted({ sortby: ['Vm-name', 'Vm-num_cpu'], group: 'Yes' }));
      expect(document.getElementById('summary-sort-2')).toHaveValue('Vm-num_cpu');

      change('summary-sort-1', '<<<Nothing>>>');

      await waitFor(() => expect(document.getElementById('summary-order')).not.toBeInTheDocument());
      expect(document.getElementById('summary-sort-2')).not.toBeInTheDocument();
      expect(screen.queryByText('Break Calculations')).not.toBeInTheDocument();
    });
  });

  describe('number of rows', () => {
    const sortedData = (report = {}) => makeFormData({ report: { ...makeFormData().report, sortby: ['Vm-name'], ...report } });

    it('offers the row limits with All first', async() => {
      await openSummary(sortedData());

      const labels = Array.from(document.getElementById('summary-row-limit').options).map((option) => option.textContent);
      expect(labels).toEqual(['All', 'First 5', 'First 10', 'First 20', 'First 50', 'First 100']);
    });

    it('changes the row limit', async() => {
      await openSummary(sortedData());

      fireEvent.change(document.getElementById('summary-row-limit'), { target: { value: '20' } });

      await waitFor(() => expect(document.getElementById('summary-row-limit')).toHaveValue('20'));
    });

    it('shows a fixed All instead of the select when sort breaks are on', async() => {
      await openSummary(sortedData({ group: 'Yes' }));

      expect(document.getElementById('summary-row-limit')).not.toBeInTheDocument();
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    it('swaps the select for the fixed value when sort breaks are turned on', async() => {
      await openSummary(sortedData());

      fireEvent.change(document.getElementById('summary-group'), { target: { value: 'Counts' } });

      await waitFor(() => expect(document.getElementById('summary-row-limit')).not.toBeInTheDocument());
      expect(document.getElementById('summary-hide-details')).toBeInTheDocument();
    });
  });

  describe('sort breaks', () => {
    const breakData = (report = {}, fieldMetadata) => makeFormData({
      report: {
        ...makeFormData().report,
        sortby: ['Vm-name'],
        group: 'Yes',
        col_options: {
          'Vm-name': { header: 'Name', format: '' },
          'Vm-num_cpu': { header: 'CPUs', format: '', grouping: ['min'] },
        },
        ...report,
      },
      ...(fieldMetadata ? { field_metadata: fieldMetadata } : {}),
    });

    it('toggles Hide Detail Rows', async() => {
      await openSummary(breakData());
      const toggle = document.getElementById('summary-hide-details');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      fireEvent.click(toggle);

      await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'true'));
    });

    it('does not offer a summary row format when the column has no formats', async() => {
      await openSummary(breakData());
      expect(document.getElementById('summary-break-format')).not.toBeInTheDocument();
    });

    it('offers a summary row format when the sort column has formats', async() => {
      await openSummary(breakData({}, {
        'Vm-name': { numeric: false, available_formats: [['Short', 'short'], ['Long', 'long']] },
        'Vm-num_cpu': { numeric: true },
      }));

      const select = document.getElementById('summary-break-format');
      expect(Array.from(select.options).map((option) => option.value)).toEqual(['_none_', '', 'short', 'long']);

      fireEvent.change(select, { target: { value: 'long' } });
      await waitFor(() => expect(select).toHaveValue('long'));
    });

    it('shows the calculations the report already has ticked', async() => {
      await openSummary(breakData());

      expect(document.getElementById('Break Calculations-Vm-num_cpu-min')).toBeChecked();
      expect(document.getElementById('Break Calculations-Vm-num_cpu-max')).not.toBeChecked();
    });

    it('adds and removes break calculations', async() => {
      await openSummary(breakData());

      fireEvent.click(document.getElementById('Break Calculations-Vm-num_cpu-total'));
      await waitFor(() => expect(document.getElementById('Break Calculations-Vm-num_cpu-total')).toBeChecked());
      expect(document.getElementById('Break Calculations-Vm-num_cpu-min')).toBeChecked();

      fireEvent.click(document.getElementById('Break Calculations-Vm-num_cpu-min'));
      await waitFor(() => expect(document.getElementById('Break Calculations-Vm-num_cpu-min')).not.toBeChecked());
      expect(document.getElementById('Break Calculations-Vm-num_cpu-total')).toBeChecked();
    });

    it('says so when there are no numeric columns to calculate', async() => {
      await openSummary(breakData({}, {
        'Vm-name': { numeric: false },
        'Vm-num_cpu': { numeric: false },
      }));

      expect(screen.getByText('No numeric columns available.')).toBeInTheDocument();
    });
  });

  describe('consolidation', () => {
    const change = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });
    const consolidated = (report = {}) => makeFormData({
      report: {
        ...makeFormData().report,
        col_order: ['Vm-name', 'Vm-host', 'Vm-num_cpu'],
        headers: ['Name', 'Host', 'CPUs'],
        col_formats: ['', '', ''],
        col_options: {
          'Vm-name': { header: 'Name', format: '' },
          'Vm-host': { header: 'Host', format: '' },
          'Vm-num_cpu': { header: 'CPUs', format: '' },
        },
        ...report,
      },
      field_metadata: {
        'Vm-name': { numeric: false },
        'Vm-host': { numeric: false },
        'Vm-num_cpu': { numeric: true },
      },
    });

    it('only shows the first group-by select at first', async() => {
      await openSummary(consolidated());

      expect(document.getElementById('summary-pivot-1')).toBeInTheDocument();
      expect(document.getElementById('summary-pivot-2')).not.toBeInTheDocument();
      expect(document.getElementById('summary-pivot-3')).not.toBeInTheDocument();
      expect(screen.queryByText('Grouped Record Calculations')).not.toBeInTheDocument();
    });

    it('reveals the next group-by select each time a column is chosen', async() => {
      await openSummary(consolidated());

      change('summary-pivot-1', 'Vm-name');
      await waitFor(() => expect(document.getElementById('summary-pivot-2')).toBeInTheDocument());
      expect(document.getElementById('summary-pivot-3')).not.toBeInTheDocument();

      change('summary-pivot-2', 'Vm-host');
      await waitFor(() => expect(document.getElementById('summary-pivot-3')).toBeInTheDocument());
    });

    it('leaves columns that are already used out of the later selects', async() => {
      await openSummary(consolidated({ pivot_by1: 'Vm-name', pivot_by2: 'Vm-host' }));

      const values = (id) => Array.from(document.getElementById(id).options).map((option) => option.value);
      expect(values('summary-pivot-2')).toEqual(['<<<Nothing>>>', 'Vm-host', 'Vm-num_cpu']);
      expect(values('summary-pivot-3')).toEqual(['<<<Nothing>>>', 'Vm-num_cpu']);
    });

    it('selects the third group-by column', async() => {
      await openSummary(consolidated({ pivot_by1: 'Vm-name', pivot_by2: 'Vm-host' }));

      change('summary-pivot-3', 'Vm-num_cpu');

      await waitFor(() => expect(document.getElementById('summary-pivot-3')).toHaveValue('Vm-num_cpu'));
    });

    it('resets the later group-by columns when the first one changes', async() => {
      await openSummary(consolidated({ pivot_by1: 'Vm-name', pivot_by2: 'Vm-host', pivot_by3: 'Vm-num_cpu' }));

      change('summary-pivot-1', 'Vm-host');

      await waitFor(() => expect(document.getElementById('summary-pivot-2')).toHaveValue('<<<Nothing>>>'));
      expect(document.getElementById('summary-pivot-3')).not.toBeInTheDocument();
    });

    it('resets the third group-by column when the second one changes', async() => {
      await openSummary(consolidated({ pivot_by1: 'Vm-name', pivot_by2: 'Vm-host', pivot_by3: 'Vm-num_cpu' }));

      change('summary-pivot-2', '<<<Nothing>>>');

      await waitFor(() => expect(document.getElementById('summary-pivot-3')).not.toBeInTheDocument());
    });

    it('shows the grouped record calculations once a group-by column is chosen', async() => {
      await openSummary(consolidated());

      change('summary-pivot-1', 'Vm-name');

      expect(await screen.findByText('Grouped Record Calculations')).toBeInTheDocument();
      expect(screen.getByText('Consolidating records will not show detail records')).toBeInTheDocument();
    });

    it('adds and removes grouped record calculations', async() => {
      await openSummary(consolidated({ pivot_by1: 'Vm-name', pivot_cols: { 'Vm-num_cpu': ['avg'] } }));
      const id = (option) => `Grouped Record Calculations-Vm-num_cpu-${option}`;
      expect(document.getElementById(id('avg'))).toBeChecked();

      fireEvent.click(document.getElementById(id('max')));
      await waitFor(() => expect(document.getElementById(id('max'))).toBeChecked());

      fireEvent.click(document.getElementById(id('avg')));
      await waitFor(() => expect(document.getElementById(id('avg'))).not.toBeChecked());
      expect(document.getElementById(id('max'))).toBeChecked();
    });

    it('leaves a column that is grouped by out of the calculations', async() => {
      await openSummary(consolidated({ pivot_by1: 'Vm-num_cpu' }));

      expect(screen.getByText('No numeric columns available.')).toBeInTheDocument();
    });
  });
});
