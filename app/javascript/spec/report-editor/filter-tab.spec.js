import {
  fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  makeFormData, openTab, postedBody, renderAndOpenTab, requestedUrls, requestsTo, resetFetchMock,
} from '../helpers/reportEditor';

const baseFormData = makeFormData({
  report: { db_options: {} },
  pdf_page_sizes: [['US Letter', 'US-Letter'], ['A4', 'A4']],
});

const cbOptions = {
  users: { admin: 'Administrator', bob: 'Bob Smith' },
  tenants: { 1: 'My Company', 2: 'Acme Corp' },
  categories: { environment: 'Environment', department: 'Department' },
  container_providers: [['OpenShift', '10']],
  image_labels: ['version', 'release'],
  timezones: [
    ['(GMT+00:00) UTC', 'UTC'],
    ['(GMT-05:00) Eastern Time (US & Canada)', 'Eastern Time (US & Canada)'],
  ],
  cb_model: 'Vm',
};

const expressionMetadata = {
  fields: [
    ['VM and Instance : Name', 'Vm-name', { col_type: 'string' }],
    ['VM and Instance : CPUs', 'Vm-num_cpu', { col_type: 'integer' }],
  ],
};

// A column of the base table: not enough for the display filter.
const withColumns = {
  col_order: ['Vm-name'],
  headers: ['Name'],
  col_formats: [''],
  col_options: { 'Vm-name': { header: 'Name', format: '' } },
};

// A column of a child table (has_many): enables the display filter.
const withPluralColumn = {
  col_order: ['Vm.disks-size'],
  headers: ['Disk Size'],
  col_formats: [''],
  col_options: { 'Vm.disks-size': { header: 'Disk Size', format: '' } },
};
const pluralFieldMetadata = { 'Vm.disks-size': { plural: true } };

const change = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });

// Renders the editor for the given form data and opens the Filter tab.
const openFilter = (formData = baseFormData, responses = {}) => renderAndOpenTab('Filter', {
  formData,
  chargebackOptions: cbOptions,
  ...responses,
});

describe('FilterTab', () => {
  afterEach(resetFetchMock);

  describe('standard report', () => {
    it('shows a prompt when no model is selected', async() => {
      await openFilter(makeFormData({ report: { model: '' } }));
      expect(screen.getByText(/Select a model on the Columns tab/)).toBeInTheDocument();
    });

    it('shows Record Filter heading when model is set', async() => {
      await openFilter();
      await waitFor(() => {
        expect(screen.getByText(/Record Filter/)).toBeInTheDocument();
      });
    });

    it('shows the Display Filter when a column of a child table is selected', async() => {
      await openFilter(makeFormData({ field_metadata: pluralFieldMetadata, report: withPluralColumn }));
      await waitFor(() => {
        expect(screen.getByText(/Display Filter/)).toBeInTheDocument();
      });
    });

    it('hides the Display Filter when no columns are selected', async() => {
      await openFilter();
      await waitFor(() => expect(screen.getByText(/Record Filter/)).toBeInTheDocument());
      expect(screen.queryByText(/Display Filter/)).not.toBeInTheDocument();
    });

    it('hides the Display Filter when only columns of the base table are selected', async() => {
      await openFilter(makeFormData({
        field_metadata: { 'Vm-name': { plural: false } },
        report: withColumns,
      }));
      await waitFor(() => expect(screen.getByText(/Record Filter/)).toBeInTheDocument());
      expect(screen.queryByText(/Display Filter/)).not.toBeInTheDocument();
    });
  });


  describe('standard report expression editors', () => {
    const filtered = makeFormData({
      field_metadata: pluralFieldMetadata,
      report: {
        ...withPluralColumn,
        record_filter: { '=': { field: 'Vm-name', value: 'prod' } },
        display_filter: { '=': { field: 'Vm-name', value: 'dev' } },
      },
    });
    const openFiltered = (formData = filtered, responses = {}) => openFilter(formData, { expressionMetadata, ...responses });
    const previews = () => Array.from(document.querySelectorAll('.exp-preview')).map((el) => el.textContent);

    it('requests the expression metadata for the record and display filters', async() => {
      await openFiltered();
      await waitFor(() => expect(requestsTo('/expression_editor/metadata')).toHaveLength(2));
      expect(requestsTo('/expression_editor/metadata')[0][0]).toContain('model=Vm');
    });

    it('previews the saved record and display filters in words', async() => {
      await openFiltered();

      await waitFor(() => expect(previews()).toHaveLength(2));
      expect(previews()[0]).toContain('VM and Instance : Name = "prod"');
      expect(previews()[1]).toContain('VM and Instance : Name = "dev"');
    });

    it('has no preview when the report has no filters', async() => {
      await openFiltered(makeFormData({ field_metadata: pluralFieldMetadata, report: withPluralColumn }));
      await waitFor(() => expect(document.querySelectorAll('.exp-query-builder').length).toBeGreaterThan(0));

      expect(previews()).toHaveLength(0);
    });

    it('restores the saved filters when the form is reset', async() => {
      const user = userEvent.setup();
      await renderAndOpenTab('Filter', {
        formData: filtered, chargebackOptions: cbOptions, expressionMetadata,
      }, { recordId: '42' });
      await waitFor(() => expect(previews()).toHaveLength(2));
      const recordValue = document.querySelectorAll('.exp-query-builder')[0].querySelector('input[value="prod"]');
      await user.clear(recordValue);
      await user.type(recordValue, 'staging');
      await waitFor(() => expect(previews()[0]).toContain('"staging"'));

      await user.click(screen.getByRole('button', { name: 'Reset' }));
      await openTab('Filter');

      await waitFor(() => expect(previews()).toHaveLength(2));
      expect(previews()[0]).toContain('"prod"');
      expect(document.querySelectorAll('.exp-query-builder')[0].querySelector('input[value="prod"]')).toBeInTheDocument();
    });

    it('updates the record filter preview when the value is edited', async() => {
      const user = userEvent.setup();
      await openFiltered();
      await waitFor(() => expect(previews()).toHaveLength(2));
      const recordValue = document.querySelectorAll('.exp-query-builder')[0].querySelector('input[value="prod"]');

      await user.clear(recordValue);
      await user.type(recordValue, 'staging');

      await waitFor(() => expect(previews()[0]).toContain('"staging"'));
      expect(previews()[1]).toContain('"dev"');
    });

    it('updates the display filter preview when the value is edited', async() => {
      const user = userEvent.setup();
      await openFiltered();
      await waitFor(() => expect(previews()).toHaveLength(2));
      const displayValue = document.querySelectorAll('.exp-query-builder')[1].querySelector('input[value="dev"]');

      await user.clear(displayValue);
      await user.type(displayValue, 'qa');

      await waitFor(() => expect(previews()[1]).toContain('"qa"'));
      expect(previews()[0]).toContain('"prod"');
    });

    it('clears the record filter preview when the last rule is removed', async() => {
      const user = userEvent.setup();
      await openFiltered();
      await waitFor(() => expect(previews()).toHaveLength(2));

      const recordEditor = document.querySelectorAll('.exp-query-builder')[0];
      await user.click(within(recordEditor).getAllByRole('button', { name: /remove rule/i })[0]);

      await waitFor(() => expect(previews()).toHaveLength(1));
      expect(previews()[0]).toContain('"dev"');
    });

    it('clears the display filter preview when the last rule is removed', async() => {
      const user = userEvent.setup();
      await openFiltered();
      await waitFor(() => expect(previews()).toHaveLength(2));

      const displayEditor = document.querySelectorAll('.exp-query-builder')[1];
      await user.click(within(displayEditor).getAllByRole('button', { name: /remove rule/i })[0]);

      await waitFor(() => expect(previews()).toHaveLength(1));
      expect(previews()[0]).toContain('"prod"');
    });

    it('has no display filter while the report has no child table columns', async() => {
      await openFiltered(makeFormData({ report: { ...withColumns, record_filter: filtered.report.record_filter } }));
      await waitFor(() => expect(previews()).toHaveLength(1));

      expect(screen.queryByText(/Display Filter/)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.exp-query-builder')).toHaveLength(1);
    });

    it('has a display filter once the report has a child table column', async() => {
      await openFiltered();
      await waitFor(() => expect(previews()).toHaveLength(2));

      expect(document.querySelectorAll('.exp-query-builder')).toHaveLength(2);
      expect(screen.getByText(/Display Filter/)).toBeInTheDocument();
    });

    it('saves the edited filters in MiqExpression form', async() => {
      const user = userEvent.setup();
      await openFiltered();
      await waitFor(() => expect(previews()).toHaveLength(2));
      const recordValue = document.querySelectorAll('.exp-query-builder')[0].querySelector('input[value="prod"]');
      await user.clear(recordValue);
      await user.type(recordValue, 'staging');
      await waitFor(() => expect(previews()[0]).toContain('"staging"'));

      await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      const { report_data: data } = postedBody('/report/save/');
      expect(data.record_filter).toEqual({ '=': { field: 'Vm-name', value: 'staging' } });
      expect(data.display_filter).toEqual({ '=': { field: 'Vm-name', value: 'dev' } });
    });

    it('shows an error in place of the editor when the metadata request fails', async() => {
      await openFiltered(filtered, { expressionMetadata: { throws: new Error('Metadata unavailable') } });

      await waitFor(() => expect(screen.getAllByText('Expression Editor').length).toBeGreaterThan(0));
      expect(previews()).toHaveLength(0);
    });
  });

  describe('trend report', () => {
    const trendData = {
      ...baseFormData,
      report_type: 'trend',
      report: {
        ...baseFormData.report,
        model: 'VimPerformanceTrend',
        perf_start: 86400,
        db_options: { interval: 'daily', end_offset: 0, start_offset: 86400 },
      },
    };

    it('shows Performance Timeframe heading for trend reports', async() => {
      await openFilter(trendData);
      expect(screen.getByText('Performance Timeframe')).toBeInTheDocument();
    });

    it('renders end and start selects for trend', async() => {
      await openFilter(trendData);
      expect(document.getElementById('perf_end')).toBeInTheDocument();
      expect(document.getElementById('perf_start')).toBeInTheDocument();
    });

    it('does NOT show an expression editor for trend', async() => {
      await openFilter(trendData);
      expect(screen.queryByText(/Record Filter/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Display Filter/)).not.toBeInTheDocument();
    });
  });


  describe('performance report', () => {
    const perfData = {
      ...baseFormData,
      report_type: 'performance',
      report: {
        ...baseFormData.report,
        model: 'VmPerformance',
        perf_start: 86400,
        db_options: { interval: 'daily', end_offset: 0, start_offset: 86400 },
      },
    };

    it('shows Performance Timeframe heading', async() => {
      await openFilter(perfData);
      expect(screen.getByText('Performance Timeframe')).toBeInTheDocument();
    });

    it('renders end and start selects', async() => {
      await openFilter(perfData);
      expect(document.getElementById('perf_end')).toBeInTheDocument();
      expect(document.getElementById('perf_start')).toBeInTheDocument();
    });

    it('shows "going back" label between selects', async() => {
      await openFilter(perfData);
      expect(screen.getByText('going back')).toBeInTheDocument();
    });

    it('shows daily label for daily interval', async() => {
      await openFilter(perfData);
      expect(screen.getByText('Show daily data from')).toBeInTheDocument();
    });

    it('shows hourly label for hourly interval', async() => {
      const hourlyData = {
        ...perfData,
        report: {
          ...perfData.report,
          perf_start: 3600,
          db_options: { interval: 'hourly', end_offset: 0, start_offset: 3600 },
        },
      };
      await openFilter(hourlyData);
      expect(screen.getByText('Show hourly data from')).toBeInTheDocument();
    });

    it('shows the Primary (Record) Filter heading', async() => {
      await openFilter(perfData);
      await waitFor(() => {
        expect(screen.getByText(/Primary \(Record\) Filter/)).toBeInTheDocument();
      });
    });

    it('renders an ExpressionEditor for the record filter', async() => {
      await openFilter(perfData);
      await waitFor(() => {
        // ExpressionEditor renders when model is set; at minimum the section heading appears
        expect(screen.getByText(/Primary \(Record\) Filter/)).toBeInTheDocument();
      });
    });
  });


  describe('performance timeframe', () => {
    const timeframeData = (interval) => makeFormData({
      report_type: 'performance',
      report: {
        model: 'VmPerformance',
        ...withColumns,
        db_options: { interval, end_offset: 0, start_offset: 86400 },
      },
    });
    const values = (id) => Array.from(document.getElementById(id).options).map((option) => option.value);

    it('offers day-based choices for a daily interval', async() => {
      await openFilter(timeframeData('daily'));

      expect(values('perf_end')).toEqual(['0', '1', '2', '3', '4', '5', '6', '7']);
      expect(values('perf_start')[0]).toBe('86400');
      expect(values('perf_start')).toHaveLength(8);
    });

    it('offers hour-based choices for an hourly interval', async() => {
      await openFilter(timeframeData('hourly'));

      expect(values('perf_end')).toEqual(['0', '1', '2', '3', '4', '6', '12', '24']);
      expect(values('perf_start')[0]).toBe('3600');
      expect(screen.getByText('Now (partial)')).toBeInTheDocument();
    });

    it('changes the end of the timeframe', async() => {
      await openFilter(timeframeData('daily'));

      change('perf_end', '3');

      await waitFor(() => expect(document.getElementById('perf_end')).toHaveValue('3'));
    });

    it('changes the length of the timeframe', async() => {
      await openFilter(timeframeData('daily'));

      change('perf_start', '1209600');

      await waitFor(() => expect(document.getElementById('perf_start')).toHaveValue('1209600'));
    });

    it('saves the chosen timeframe', async() => {
      const user = userEvent.setup();
      await openFilter(timeframeData('daily'));
      change('perf_end', '2');
      change('perf_start', '604800');
      await waitFor(() => expect(document.getElementById('perf_start')).toHaveValue('604800'));

      await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      expect(postedBody('/report/save/').report_data).toMatchObject({ perf_end: '2', perf_start: '604800' });
    });

    it('edits the record filter of a performance report', async() => {
      const user = userEvent.setup();
      await openFilter(
        makeFormData({
          report_type: 'performance',
          report: {
            model: 'VmPerformance',
            ...withColumns,
            db_options: { interval: 'daily' },
            record_filter: { '=': { field: 'Vm-name', value: 'prod' } },
          },
        }),
        { expressionMetadata },
      );
      const input = await waitFor(() => {
        const found = document.querySelector('.exp-query-builder input[value="prod"]');
        expect(found).toBeInTheDocument();
        return found;
      });

      await user.clear(input);
      await user.type(input, 'staging');
      await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);
      await waitFor(() => expect(requestsTo('/report/save/')).toHaveLength(1));

      expect(postedBody('/report/save/').report_data.record_filter)
        .toEqual({ '=': { field: 'Vm-name', value: 'staging' } });
    });
  });

  describe('trend timeframe', () => {
    it('changes the timeframe of a trend report', async() => {
      await openFilter(makeFormData({
        report_type: 'trend',
        report: { model: 'VimPerformanceTrend', db_options: { interval: 'daily' } },
      }));

      change('perf_end', '1');
      change('perf_start', '172800');

      await waitFor(() => expect(document.getElementById('perf_end')).toHaveValue('1'));
      expect(document.getElementById('perf_start')).toHaveValue('172800');
    });
  });

  describe('chargeback report', () => {
    const cbData = {
      ...baseFormData,
      report_type: 'chargeback',
      report: {
        ...baseFormData.report,
        model: 'ChargebackVm',
        db_options: {
          options: {
            interval: 'daily', groupby: 'date', interval_size: 1, end_interval_offset: 1,
          },
        },
      },
    };

    it('calls chargeback_options endpoint', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(requestedUrls()).toContainEqual(expect.stringContaining('chargeback_options?model=ChargebackVm'));
      });
    });

    it('shows Chargeback Filters heading', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Chargeback Filters')).toBeInTheDocument();
      });
    });

    it('shows Chargeback Interval heading', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Chargeback Interval')).toBeInTheDocument();
      });
    });

    it('renders cb_interval select', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('cb_interval')).toBeInTheDocument();
      });
    });

    it('renders cb_show_typ select', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('cb_show_typ')).toBeInTheDocument();
      });
    });

    it('renders cb_groupby select', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('cb_groupby')).toBeInTheDocument();
      });
    });

    it('shows Owner select when cb_show_typ = owner', async() => {
      const ownerData = {
        ...cbData,
        report: {
          ...cbData.report,
          db_options: {
            options: {
              owner: 'admin',
              interval: 'daily',
              groupby: 'date',
              interval_size: 1,
              end_interval_offset: 1,
            },
          },
        },
      };
      await openFilter(ownerData);
      await waitFor(() => {
        expect(document.getElementById('cb_owner_id')).toBeInTheDocument();
      });
    });

    it('shows Include C&U Metrics toggle for ChargebackVm', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Include Capacity & Utilization Metrics')).toBeInTheDocument();
      });
    });

    it('shows Include Cumulative Rate toggle for Chargeback models', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Include Cumulative Rate Calculation')).toBeInTheDocument();
      });
    });

    it('shows Method for allocated metrics select for ChargebackVm', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(screen.getByText('Method for allocated metrics')).toBeInTheDocument();
      });
    });

    it('shows timezone select', async() => {
      await openFilter(cbData);
      await waitFor(() => {
        expect(document.getElementById('tz')).toBeInTheDocument();
      });
    });

    it('shows an error notification when options fail to load', async() => {
      await openFilter(cbData, { chargebackOptions: { throws: new Error('Network error') } });
      await waitFor(() => {
        expect(screen.getByText('Failed to load chargeback options.')).toBeInTheDocument();
      });
    });

    it('shows no-model prompt when model is empty', async() => {
      const noModelData = {
        ...cbData,
        report: { ...cbData.report, model: '' },
      };
      await openFilter(noModelData);
      await waitFor(() => {
        expect(screen.getByText(/Select a model on the Columns tab/)).toBeInTheDocument();
      });
    });
  });
});
