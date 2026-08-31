import PropTypes from 'prop-types';
import {
  Checkbox,
  Select,
  SelectItem,
  Tile,
} from '@carbon/react';
import { useFormApi, useFieldApi } from '@@ddf';
import {
  AreaChartGraph,
  DonutChartGraph,
  GroupBarChart,
  GroupHorizontalBarChart,
  LineChartGraph,
  PieChartGraph,
  StackAreaChart,
  StackBarChartGraph,
  StackHorizontalChart,
} from '../../carbon-charts';
import { pieData, sampleData } from '../../carbon-charts/helpers';
import { FormRow } from '../form-row';
import { NOTHING, buildLabelMap, getColumnMeta } from '../utils';
import { useFieldMetadata } from '../field-metadata-context';

const NO_CHART = '';
const TOP_VALUE_OPTIONS = Array.from({ length: 18 }, (_, index) => String(index + 3));

const CHART_COMPONENTS = {
  Area: AreaChartGraph,
  Bar: GroupHorizontalBarChart,
  Column: GroupBarChart,
  Donut: DonutChartGraph,
  Line: LineChartGraph,
  Pie: PieChartGraph,
  StackedArea: StackAreaChart,
  StackedBar: StackHorizontalChart,
  StackedColumn: StackBarChartGraph,
};

const ChartsTab = ({ formData }) => {
  const formOptions = useFormApi();
  const { input: { value: graphType = NO_CHART } } = useFieldApi({ name: 'graph_type' });
  const { input: { value: sortby = [] } } = useFieldApi({ name: 'sortby' });
  const { input: { value: group = 'No' } } = useFieldApi({ name: 'group' });
  const { input: { value: graphMode = 'counts' } } = useFieldApi({ name: 'graph_mode' });
  const { input: { value: graphCount = '10' } } = useFieldApi({ name: 'graph_count' });
  const { input: { value: graphColumn = '' } } = useFieldApi({ name: 'graph_column' });
  const { input: { value: graphOther = true } } = useFieldApi({ name: 'graph_other' });
  const { input: { value: colOrder = [] } } = useFieldApi({ name: 'col_order' });
  const { availableFields, fieldMetadata } = useFieldMetadata();

  const chartTypes = formData.chart_types || [];
  const primarySort = sortby[0] || NOTHING;
  const hasSort = primarySort !== NOTHING && primarySort !== '';
  const valuesAllowed = group !== 'Counts';
  const effectiveGraphMode = valuesAllowed ? graphMode : 'counts';
  const labelMap = buildLabelMap(availableFields);
  const numericColumns = colOrder
    .filter((fieldId) => getColumnMeta(fieldMetadata, fieldId).numeric)
    .map((fieldId) => [labelMap[fieldId] || fieldId, fieldId]);

  const previewTitle = graphType ? sprintf(__('%s Chart Preview'), graphType) : __('Chart Preview');
  const PreviewComponent = CHART_COMPONENTS[graphType];
  const previewData = ['Pie', 'Donut'].includes(graphType) ? pieData : sampleData;

  const selectChartType = (value) => {
    if (!hasSort) {
      return;
    }
    formOptions.change('graph_type', value);
    if (!value) {
      return;
    }
    if (!valuesAllowed) {
      formOptions.change('graph_mode', 'counts');
    } else if (!graphMode) {
      formOptions.change('graph_mode', 'counts');
    }
    if (!graphCount) {
      formOptions.change('graph_count', '10');
    }
  };

  return (
    <div>
      <p className="report-editor-filter__text-muted report-editor-preview__toolbar">
        {hasSort
          ? __('Select a chart type below, or choose "No Chart" to disable charting.')
          : __('A sort field is required to use charts. Configure one in the Summary tab.')}
      </p>

      <div className={`report-editor-charts__tiles${!hasSort ? ' report-editor-charts__tiles--disabled' : ''}`}>
        <Tile
          role="button"
          tabIndex={hasSort ? 0 : -1}
          id="chart-tile-none"
          className={`report-editor-charts__tile${
            hasSort && graphType === NO_CHART ? ' report-editor-charts__tile--selected' : ' report-editor-charts__tile--unselected'
          }`}
          onClick={() => selectChartType(NO_CHART)}
        >
          <strong>{__('No Chart')}</strong>
          <div>{__('Disable charting')}</div>
        </Tile>
        {chartTypes.map(([label, value]) => (
          <Tile
            key={value}
            role="button"
            tabIndex={hasSort ? 0 : -1}
            id={`chart-tile-${value}`}
            className={`report-editor-charts__tile${
              hasSort && graphType === value ? ' report-editor-charts__tile--selected' : ' report-editor-charts__tile--unselected'
            }`}
            onClick={() => selectChartType(value)}
          >
            <strong>{label}</strong>
            <div>{__('Chart')}</div>
          </Tile>
        ))}
      </div>

      {hasSort && graphType && (
        <>
          <FormRow label={__('Chart mode')}>
            {valuesAllowed ? (
              <Select
                id="chart-mode"
                labelText=""
                hideLabel
                value={effectiveGraphMode}
                onChange={(e) => formOptions.change('graph_mode', e.target.value)}
              >
                <SelectItem value="counts" text={__('Counts')} />
                <SelectItem value="values" text={__('Values')} />
              </Select>
            ) : (
              <div>
                {__('Counts')}
              </div>
            )}
          </FormRow>

          {effectiveGraphMode === 'values' && (
            <FormRow label={__('Data column')}>
              <Select
                id="chart-column"
                labelText=""
                hideLabel
                value={graphColumn}
                onChange={(e) => formOptions.change('graph_column', e.target.value)}
              >
                <SelectItem value="" text={__('Nothing selected')} />
                {numericColumns.map(([label, value]) => <SelectItem key={value} value={value} text={label} />)}
              </Select>
            </FormRow>
          )}

          <FormRow label={__('Top values to show')}>
            <Select
              id="chart-count"
              labelText=""
              hideLabel
              value={graphCount || '10'}
              onChange={(e) => formOptions.change('graph_count', e.target.value)}
            >
              {TOP_VALUE_OPTIONS.map((value) => <SelectItem key={value} value={value} text={value} />)}
            </Select>
          </FormRow>

          <FormRow label={__("Sum 'Other' values")}>
            <Checkbox
              id="chart-other"
              labelText=""
              checked={graphOther !== false}
              onChange={(_, { checked }) => formOptions.change('graph_other', checked)}
            />
          </FormRow>

          {['Pie', 'Donut'].includes(graphType) && (
            <p className="report-editor-preview__toolbar">
              {__('Pie and Donut charts are not recommended for small percentages because the labels may overlap.')}
            </p>
          )}

          {PreviewComponent && (
            <div className="report-editor-charts__preview-container">
              <h4 className="report-editor-section__heading">{__('Live Preview')}</h4>
              <PreviewComponent data={previewData} title={previewTitle} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

ChartsTab.propTypes = {
  formData: PropTypes.shape({
    chart_types: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  }).isRequired,
};

export default ChartsTab;
