import { screen, waitFor, fireEvent } from '@testing-library/react';
import {
  makeFormData as makeBaseFormData, renderAndOpenTab, resetFetchMock,
} from '../helpers/reportEditor';

// The real charts need SVG layout APIs that jsdom lacks; stand-ins show which chart got which props.
jest.mock('../../components/carbon-charts', () => {
  const stub = (name) => ({ data, title }) => (
    <div data-testid={`chart-${name}`} data-title={title} data-rows={data ? data.length : 0} />
  );
  return {
    AreaChartGraph: stub('Area'),
    DonutChartGraph: stub('Donut'),
    GroupBarChart: stub('Column'),
    GroupHorizontalBarChart: stub('Bar'),
    LineChartGraph: stub('Line'),
    PieChartGraph: stub('Pie'),
    StackAreaChart: stub('StackedArea'),
    StackBarChartGraph: stub('StackedColumn'),
    StackHorizontalChart: stub('StackedBar'),
  };
});

const makeFormData = ({ report, ...rest } = {}) => makeBaseFormData({
  report: {
    col_order: ['Vm-name'],
    headers: ['Name'],
    col_formats: [''],
    col_options: { 'Vm-name': { header: 'Name', format: '' } },
    sortby: ['Vm-name'],
    order: 'Ascending',
    group: 'No',
    hide_details: false,
    row_limit: null,
    graph_type: '',
    graph_mode: 'counts',
    graph_column: '',
    graph_count: 10,
    graph_other: true,
    ...report,
  },
  models: [['Virtual Machines', 'Vm']],
  field_metadata: { 'Vm-name': { numeric: false } },
  chart_types: [['Bar', 'Bar'], ['Column', 'Column'], ['Pie', 'Pie']],
  ...rest,
});

const openCharts = (formData = makeFormData()) => renderAndOpenTab('Charts', { formData });

describe('ChartsTab (via ReportEditor)', () => {
  afterEach(resetFetchMock);

  it('shows the "sort required" hint when no primary sort is set', async() => {
    await openCharts(makeFormData({
      report: {
        ...makeFormData().report,
        sortby: [],
      },
    }));
    expect(screen.getByText(/A sort field is required/)).toBeInTheDocument();
  });

  it('shows chart type tiles when a sort is set', async() => {
    await openCharts();
    expect(screen.getByText('No Chart')).toBeInTheDocument();
    expect(screen.getByText('Bar')).toBeInTheDocument();
    expect(screen.getByText('Column')).toBeInTheDocument();
  });

  it('renders chart options after clicking a chart type', async() => {
    // Use a chart type that has no preview component to avoid jsdom SVG crash
    await openCharts(makeFormData({
      chart_types: [['TestChart', 'TestChart']],
    }));
    const testTile = document.getElementById('chart-tile-TestChart');
    fireEvent.click(testTile);
    await waitFor(() => expect(screen.getByText('Chart mode')).toBeInTheDocument());
    expect(screen.getByText('Top values to show')).toBeInTheDocument();
    expect(screen.getByText("Sum 'Other' values")).toBeInTheDocument();
  });

  it('shows "Values" mode select with Counts and Values options', async() => {
    await openCharts(makeFormData({
      chart_types: [['TestChart', 'TestChart']],
    }));
    const testTile = document.getElementById('chart-tile-TestChart');
    fireEvent.click(testTile);
    await waitFor(() => expect(document.getElementById('chart-mode')).toBeInTheDocument());
    const modeSelect = document.getElementById('chart-mode');
    expect(Array.from(modeSelect.options).map((option) => option.value)).toEqual(['counts', 'values']);
  });

  it('shows Data column select when mode is values', async() => {
    await openCharts(makeFormData({
      report: {
        ...makeFormData().report,
        graph_type: 'TestChart',
        graph_mode: 'values',
        group: 'No',
      },
      chart_types: [['TestChart', 'TestChart']],
      field_metadata: { 'Vm-name': { numeric: true } },
    }));
    expect(document.getElementById('chart-column')).toBeInTheDocument();
  });

  it('shows Pie/Donut warning for Pie chart type', async() => {
    // Use a fake chart type that triggers the Pie/Donut path (startsWith Pie/Donut check)
    // The component uses ['Pie','Donut'].includes(graphType)
    await openCharts(makeFormData({
      report: {
        ...makeFormData().report,
        graph_type: 'Pie',
      },
      // No Pie entry so no CHART_COMPONENTS preview for Pie renders in this path
      chart_types: [],
    }));
    expect(screen.getByText(/Pie and Donut charts are not recommended/)).toBeInTheDocument();
  });

  it('resets to No Chart when No Chart tile is clicked', async() => {
    await openCharts(makeFormData({
      report: {
        ...makeFormData().report,
        graph_type: 'TestChart',
      },
      chart_types: [['TestChart', 'TestChart']],
    }));
    const noChartTile = document.getElementById('chart-tile-none');
    fireEvent.click(noChartTile);
    await waitFor(() => expect(screen.queryByText('Chart mode')).not.toBeInTheDocument());
  });

  describe('options', () => {
    const withChart = (report = {}, rest = {}) => makeFormData({
      report: { ...makeFormData().report, graph_type: 'TestChart', ...report },
      chart_types: [['TestChart', 'TestChart']],
      ...rest,
    });
    const change = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });

    it('does nothing when a tile is clicked without a primary sort', async() => {
      await openCharts(makeFormData({
        report: { ...makeFormData().report, sortby: [] },
        chart_types: [['TestChart', 'TestChart']],
      }));

      fireEvent.click(document.getElementById('chart-tile-TestChart'));

      expect(screen.queryByText('Chart mode')).not.toBeInTheDocument();
      expect(document.getElementById('chart-tile-TestChart')).toHaveAttribute('tabindex', '-1');
    });

    it('lets a tile be focused when a primary sort is set', async() => {
      await openCharts(withChart({ graph_type: '' }));
      expect(document.getElementById('chart-tile-TestChart')).toHaveAttribute('tabindex', '0');
    });

    it('selects another chart type', async() => {
      await openCharts(withChart({}, { chart_types: [['TestChart', 'TestChart'], ['Other', 'Other']] }));
      expect(document.getElementById('chart-tile-TestChart')).toHaveClass('report-editor-charts__tile--selected');

      fireEvent.click(document.getElementById('chart-tile-Other'));

      await waitFor(() => expect(document.getElementById('chart-tile-Other')).toHaveClass('report-editor-charts__tile--selected'));
      expect(document.getElementById('chart-tile-TestChart')).toHaveClass('report-editor-charts__tile--unselected');
    });

    it('switches the mode to values and offers the numeric columns', async() => {
      await openCharts(withChart({}, { field_metadata: { 'Vm-name': { numeric: true } } }));
      expect(document.getElementById('chart-column')).not.toBeInTheDocument();

      change('chart-mode', 'values');

      await waitFor(() => expect(document.getElementById('chart-column')).toBeInTheDocument());
      expect(Array.from(document.getElementById('chart-column').options).map((option) => option.value))
        .toEqual(['', 'Vm-name']);
    });

    it('chooses the data column', async() => {
      await openCharts(withChart(
        { graph_mode: 'values' },
        { field_metadata: { 'Vm-name': { numeric: true } } },
      ));

      change('chart-column', 'Vm-name');

      await waitFor(() => expect(document.getElementById('chart-column')).toHaveValue('Vm-name'));
    });

    it('changes the number of top values to show', async() => {
      await openCharts(withChart());
      const values = Array.from(document.getElementById('chart-count').options).map((option) => option.value);
      expect(values[0]).toBe('3');
      expect(values).toHaveLength(18);

      change('chart-count', '12');

      await waitFor(() => expect(document.getElementById('chart-count')).toHaveValue('12'));
    });

    it('toggles summing the other values', async() => {
      await openCharts(withChart());
      expect(document.getElementById('chart-other')).toBeChecked();

      fireEvent.click(document.getElementById('chart-other'));

      await waitFor(() => expect(document.getElementById('chart-other')).not.toBeChecked());
    });

    it('shows a fixed Counts mode when sort breaks are counts', async() => {
      await openCharts(withChart({ group: 'Counts', graph_mode: 'values' }));

      expect(document.getElementById('chart-mode')).not.toBeInTheDocument();
      expect(document.getElementById('chart-column')).not.toBeInTheDocument();
      expect(screen.getByText('Chart mode').closest('.report-editor-row')).toHaveTextContent('Counts');
    });

    it('forces the Counts mode when a chart is chosen while sort breaks are counts', async() => {
      await openCharts(withChart({ group: 'Counts', graph_mode: 'values', graph_type: '' }));

      fireEvent.click(document.getElementById('chart-tile-TestChart'));

      await waitFor(() => expect(screen.getByText('Chart mode')).toBeInTheDocument());
      expect(document.getElementById('chart-column')).not.toBeInTheDocument();
    });

    it('defaults to Counts mode and ten top values when a chart is chosen without either saved', async() => {
      await openCharts(withChart({ graph_type: '', graph_mode: '', graph_count: '' }));

      fireEvent.click(document.getElementById('chart-tile-TestChart'));

      await waitFor(() => expect(document.getElementById('chart-mode')).toHaveValue('counts'));
      expect(document.getElementById('chart-count')).toHaveValue('10');
    });

    it('keeps the saved mode and top values when another chart is chosen', async() => {
      await openCharts(withChart(
        { graph_type: '', graph_mode: 'values', graph_count: 7 },
        { chart_types: [['TestChart', 'TestChart']], field_metadata: { 'Vm-name': { numeric: true } } },
      ));

      fireEvent.click(document.getElementById('chart-tile-TestChart'));

      await waitFor(() => expect(document.getElementById('chart-mode')).toHaveValue('values'));
      expect(document.getElementById('chart-count')).toHaveValue('7');
    });

    it('does not show the pie warning for other chart types', async() => {
      await openCharts(withChart());
      expect(screen.queryByText(/Pie and Donut charts are not recommended/)).not.toBeInTheDocument();
    });
  });

  describe('live preview', () => {
    const previewOf = (type, report = {}) => makeFormData({
      report: { ...makeFormData().report, graph_type: type, ...report },
      chart_types: [[type, type]],
    });

    it.each([
      ['Area'], ['Bar'], ['Column'], ['Donut'], ['Line'], ['Pie'], ['StackedArea'], ['StackedBar'], ['StackedColumn'],
    ])('renders the %s chart', async(type) => {
      await openCharts(previewOf(type));

      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      expect(screen.getByTestId(`chart-${type}`)).toHaveAttribute('data-title', `${type} Chart Preview`);
    });

    it('gives the preview sample data', async() => {
      await openCharts(previewOf('Bar'));
      expect(Number(screen.getByTestId('chart-Bar').dataset.rows)).toBeGreaterThan(0);
    });

    it('uses different sample data for pie and donut charts', async() => {
      await openCharts(previewOf('Bar'));
      const barRows = screen.getByTestId('chart-Bar').dataset.rows;
      await openCharts(previewOf('Pie'));

      expect(screen.getByTestId('chart-Pie').dataset.rows).not.toBe(barRows);
    });

    it('shows the pie warning together with the pie preview', async() => {
      await openCharts(previewOf('Pie'));
      expect(screen.getByText(/Pie and Donut charts are not recommended/)).toBeInTheDocument();
      expect(screen.getByTestId('chart-Pie')).toBeInTheDocument();
    });

    it('has no preview when no chart is selected', async() => {
      await openCharts(previewOf(''));
      expect(screen.queryByText('Live Preview')).not.toBeInTheDocument();
    });

    it('shows the preview once a chart type is clicked', async() => {
      await openCharts(previewOf('Line', { graph_type: '' }));
      expect(screen.queryByTestId('chart-Line')).not.toBeInTheDocument();

      fireEvent.click(document.getElementById('chart-tile-Line'));

      expect(await screen.findByTestId('chart-Line')).toBeInTheDocument();
    });
  });
});
