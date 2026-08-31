import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  MultiSelect,
  Select,
  SelectItem,
  Toggle,
  InlineNotification,
  Loading,
} from '@carbon/react';
import { useFormApi, useFieldApi } from '@@ddf';
import ExpressionEditor from '../../expression-editor';
import { rqbToMiq } from '../../expression-editor/expression-adapter';
import { miqExpressionToHuman } from '../../expression-editor/expression-human';
import { FormRow, LabeledSection } from '../form-row';

// ---------------------------------------------------------------------------
// Standard filter variant
// ---------------------------------------------------------------------------

const StandardFilter = ({ formValues, formOptions }) => {
  const hasColumns = (formValues.col_order || []).length > 0;

  // Preview state — same pattern as ExpressionEditorField in condition-form.
  // *Ref naming: ExpressionEditor passes tagValuesCache as a { current: Map } ref object
  // so that tag lookups always read the latest values without re-firing the callback.
  // We store the ref object itself, then read .current when we need the Map.
  const recordLabelMapRef = useRef(new Map());
  const recordTagCacheRefObj = useRef(null); // holds the { current: Map } ref from ExpressionEditor
  const displayLabelMapRef = useRef(new Map());
  const displayTagCacheRefObj = useRef(null);
  const [recordPreview, setRecordPreview] = useState('');
  const [displayPreview, setDisplayPreview] = useState('');

  const handleRecordContextReady = useCallback((labelMap, tagValuesCache) => {
    recordLabelMapRef.current = labelMap;
    recordTagCacheRefObj.current = tagValuesCache; // store the ref object
    // Seed the preview from the initial value (a MiqExpression hash when editing
    // an existing report that already has a filter).
    const initial = formOptions.getState().values.record_filter;
    if (initial && initial.combinator === undefined) {
      // It's a MiqExpression hash (not yet touched by the user) — render it directly.
      const tagMap = tagValuesCache ? tagValuesCache.current : new Map();
      setRecordPreview(miqExpressionToHuman(initial, labelMap, tagMap));
    }
  }, [formOptions]);

  const handleDisplayContextReady = useCallback((labelMap, tagValuesCache) => {
    displayLabelMapRef.current = labelMap;
    displayTagCacheRefObj.current = tagValuesCache; // store the ref object
    const initial = formOptions.getState().values.display_filter;
    if (initial && initial.combinator === undefined) {
      const tagMap = tagValuesCache ? tagValuesCache.current : new Map();
      setDisplayPreview(miqExpressionToHuman(initial, displayLabelMapRef.current, tagMap));
    }
  }, [formOptions]);

  const handleRecordFilterChange = useCallback((query) => {
    formOptions.change('record_filter', query);
    const miq = rqbToMiq(query);
    const tagMap = recordTagCacheRefObj.current ? recordTagCacheRefObj.current.current : new Map();
    setRecordPreview(miq ? miqExpressionToHuman(miq, recordLabelMapRef.current, tagMap) : '');
  }, [formOptions]);

  const handleDisplayFilterChange = useCallback((query) => {
    formOptions.change('display_filter', query);
    const miq = rqbToMiq(query);
    const tagMap = displayTagCacheRefObj.current ? displayTagCacheRefObj.current.current : new Map();
    setDisplayPreview(miq ? miqExpressionToHuman(miq, displayLabelMapRef.current, tagMap) : '');
  }, [formOptions]);

  if (!formValues.model) {
    return (
      <p className="report-editor-filter__text-muted">
        {__('Select a model on the Columns tab to configure filters.')}
      </p>
    );
  }

  return (
    <>
      <LabeledSection
        title={__('Record Filter — filters the %{model} table records').replace('%{model}', formValues.model)}
      >
        <ExpressionEditor
          model={formValues.model}
          value={formValues.record_filter || null}
          onQueryChange={handleRecordFilterChange}
          onContextReady={handleRecordContextReady}
          seedEmpty
        />
        {recordPreview && (
          <div className="exp-preview">
            <div className="exp-preview__label">{__('Preview')}</div>
            <div>{recordPreview}</div>
          </div>
        )}
      </LabeledSection>

      <LabeledSection title={__('Display Filter — filters rows based on child table fields')}>
        {hasColumns ? (
          <>
            <ExpressionEditor
              model={formValues.model}
              value={formValues.display_filter || null}
              onQueryChange={handleDisplayFilterChange}
              onContextReady={handleDisplayContextReady}
              seedEmpty={false}
            />
            {displayPreview && (
              <div className="exp-preview">
                <div className="exp-preview__label">{__('Preview')}</div>
                <div>{displayPreview}</div>
              </div>
            )}
          </>
        ) : (
          <p className="report-editor-filter__text-muted">
            {__('Add columns first to enable the display filter.')}
          </p>
        )}
      </LabeledSection>
    </>
  );
};

StandardFilter.propTypes = {
  formValues: PropTypes.shape({
    model: PropTypes.string,
    col_order: PropTypes.arrayOf(PropTypes.string),
    record_filter: PropTypes.shape({}),
    display_filter: PropTypes.shape({}),
  }).isRequired,
  formOptions: PropTypes.shape({ change: PropTypes.func }).isRequired,
};

// ---------------------------------------------------------------------------
// Performance Timeframe constants (used by both Trend and Performance)
// ---------------------------------------------------------------------------

// End options: daily / hourly
const PERF_END_DAILY = [
  [__('Today (partial)'), '0'],
  [__('Yesterday'), '1'],
  [__('2 Days Ago'), '2'],
  [__('3 Days Ago'), '3'],
  [__('4 Days Ago'), '4'],
  [__('5 Days Ago'), '5'],
  [__('6 Days Ago'), '6'],
  [__('1 Week Ago'), '7'],
];

const PERF_END_HOURLY = [
  [__('Now (partial)'), '0'],
  [__('1 Hour Ago'), '1'],
  [__('2 Hours Ago'), '2'],
  [__('3 Hours Ago'), '3'],
  [__('4 Hours Ago'), '4'],
  [__('6 Hours Ago'), '6'],
  [__('12 Hours Ago'), '12'],
  [__('1 Day Ago'), '24'],
];

// Start (going back) options
const PERF_START_DAILY = [
  [__('1 Day'), (1 * 24 * 3600).toString()],
  [__('2 Days'), (2 * 24 * 3600).toString()],
  [__('3 Days'), (3 * 24 * 3600).toString()],
  [__('4 Days'), (4 * 24 * 3600).toString()],
  [__('5 Days'), (5 * 24 * 3600).toString()],
  [__('6 Days'), (6 * 24 * 3600).toString()],
  [__('1 Week'), (7 * 24 * 3600).toString()],
  [__('2 Weeks'), (14 * 24 * 3600).toString()],
];

const PERF_START_HOURLY = [
  [__('1 Hour'), '3600'],
  [__('2 Hours'), '7200'],
  [__('3 Hours'), '10800'],
  [__('4 Hours'), '14400'],
  [__('6 Hours'), '21600'],
  [__('12 Hours'), '43200'],
  [__('1 Day'), '86400'],
  [__('2 Days'), '172800'],
];

// ---------------------------------------------------------------------------
// Shared: the Performance Timeframe rows (reused by Trend and Performance)
// ---------------------------------------------------------------------------

const PerformanceTimeframe = ({ formValues, formOptions }) => {
  const isHourly = formValues.perf_interval === 'hourly';
  const endOptions = isHourly ? PERF_END_HOURLY : PERF_END_DAILY;
  const startOptions = isHourly ? PERF_START_HOURLY : PERF_START_DAILY;

  return (
    <LabeledSection title={__('Performance Timeframe')}>
      <FormRow label={isHourly ? __('Show hourly data from') : __('Show daily data from')}>
        <div className="report-editor-row__content--flex-center">
          <Select
            id="perf_end"
            labelText=""
            hideLabel
            value={formValues.perf_end || '0'}
            onChange={(e) => formOptions.change('perf_end', e.target.value)}
          >
            {endOptions.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
          <span className="report-editor-filter__going-back">{__('going back')}</span>
          <Select
            id="perf_start"
            labelText=""
            hideLabel
            value={formValues.perf_start || startOptions[0][1]}
            onChange={(e) => formOptions.change('perf_start', e.target.value)}
          >
            {startOptions.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
        </div>
      </FormRow>
    </LabeledSection>
  );
};

PerformanceTimeframe.propTypes = {
  formValues: PropTypes.shape({
    perf_interval: PropTypes.string,
    perf_end: PropTypes.string,
    perf_start: PropTypes.string,
  }).isRequired,
  formOptions: PropTypes.shape({ change: PropTypes.func }).isRequired,
};

// ---------------------------------------------------------------------------
// Trend filter variant — Performance Timeframe only; no expression editors
// ---------------------------------------------------------------------------

const TrendFilter = ({ formValues, formOptions }) => (
  <PerformanceTimeframe formValues={formValues} formOptions={formOptions} />
);

TrendFilter.propTypes = {
  formValues: PropTypes.shape({
    perf_interval: PropTypes.string,
    perf_end: PropTypes.string,
    perf_start: PropTypes.string,
  }).isRequired,
  formOptions: PropTypes.shape({ change: PropTypes.func }).isRequired,
};

// ---------------------------------------------------------------------------
// Performance filter variant — Timeframe + Primary Record Filter
// ---------------------------------------------------------------------------

const PerformanceFilter = ({ formValues, formOptions }) => {
  const handleRecordFilterChange = useCallback((query) => {
    formOptions.change('record_filter', query);
  }, [formOptions]);

  return (
    <>
      <PerformanceTimeframe formValues={formValues} formOptions={formOptions} />

      <LabeledSection
        title={__('Primary (Record) Filter — filters the %{model} table records').replace('%{model}', formValues.model || '')}
      >
        <ExpressionEditor
          model={formValues.model}
          value={formValues.record_filter || null}
          onQueryChange={handleRecordFilterChange}
          seedEmpty
        />
      </LabeledSection>
    </>
  );
};

PerformanceFilter.propTypes = {
  formValues: PropTypes.shape({
    model: PropTypes.string,
    perf_interval: PropTypes.string,
    perf_end: PropTypes.string,
    perf_start: PropTypes.string,
    record_filter: PropTypes.shape({}),
  }).isRequired,
  formOptions: PropTypes.shape({ change: PropTypes.func }).isRequired,
};

// ---------------------------------------------------------------------------
// Chargeback filter variant
// ---------------------------------------------------------------------------

// Build interval-dependent end/going-back option arrays (mirroring the HAML).
function buildCbIntervalOptions(interval) {
  switch (interval) {
    case 'daily':
      return {
        endOpts: [
          [__('Today (partial)'), 0],
          [__('Yesterday'), 1],
          [__('2 Days Ago'), 2],
          [__('3 Days Ago'), 3],
          [__('4 Days Ago'), 4],
          [__('5 Days Ago'), 5],
          [__('6 Days Ago'), 6],
          [__('1 Week Ago'), 7],
        ],
        sizeOpts: [
          [__('1 Day'), 1],
          [__('2 Days'), 2],
          [__('3 Days'), 3],
          [__('4 Days'), 4],
          [__('5 Days'), 5],
          [__('6 Days'), 6],
          [__('1 Week'), 7],
          [__('2 Weeks'), 14],
          [__('3 Weeks'), 21],
          [__('4 Weeks'), 28],
          [__('5 Weeks'), 35],
        ],
      };
    case 'weekly':
      return {
        endOpts: [
          [__('This Week (partial)'), 0],
          [__('Last Week'), 1],
          [__('2 Weeks Ago'), 2],
          [__('3 Weeks Ago'), 3],
          [__('4 Weeks Ago'), 4],
        ],
        sizeOpts: [
          [__('1 Week'), 1],
          [__('2 Weeks'), 2],
          [__('3 Weeks'), 3],
          [__('4 Weeks'), 4],
          [__('8 Weeks'), 8],
          [__('12 Weeks'), 12],
        ],
      };
    case 'monthly':
    default:
      return {
        endOpts: [
          [__('This Month (partial)'), 0],
          [__('Last Month'), 1],
          [__('2 Months Ago'), 2],
          [__('3 Months Ago'), 3],
        ],
        sizeOpts: [
          [__('1 Month'), 1],
          [__('2 Months'), 2],
          [__('3 Months'), 3],
          [__('6 Months'), 6],
          [__('9 Months'), 9],
          [__('12 Months'), 12],
        ],
      };
  }
}

const ChargebackFilter = ({ formValues, formOptions, model }) => {
  const [{ loading, cbOpts, error }, setCbState] = useState({
    loading: true,
    cbOpts: null,
    error: null,
  });

  // Derived flags
  const isVm = model === 'ChargebackVm' || model === 'MeteringVm';
  const isChargeback = model.startsWith('Chargeback');
  const isMetering = model.startsWith('Metering');
  const isContainerImage = model === 'ChargebackContainerImage' || model === 'MeteringContainerImage';
  const isContainerProject = model === 'ChargebackContainerProject' || model === 'MeteringContainerProject';

  // Load chargeback options from backend (includes tag_values map for all categories).
  useEffect(() => {
    if (!model) {
      return;
    }
    setCbState({ loading: true, cbOpts: null, error: null });
    http.get(`/report/react_chargeback_options?model=${encodeURIComponent(model)}`)
      .then((data) => setCbState({ loading: false, cbOpts: data, error: null }))
      .catch(() => setCbState({
        loading: false,
        cbOpts: null,
        error: __('Failed to load chargeback options.'),
      }));
  }, [model]);

  // Derive tag values for the selected category directly from the initial payload.
  // The server now includes tag_values: { category_name: [[name, desc], ...] }.
  // No second request is needed.
  const tagValues = cbOpts?.tag_values?.[formValues.cb_tag_cat] || [];

  // Entity list for the selected container provider (GAP 4).
  const [entityList, setEntityList] = useState([]);
  useEffect(() => {
    const providerId = formValues.cb_provider_id;
    if (!providerId || providerId === 'all') {
      setEntityList([]);
      return;
    }
    http.get(`/report/react_chargeback_entities?provider_id=${encodeURIComponent(providerId)}&model=${encodeURIComponent(model)}`)
      .then((data) => setEntityList(data.entities || []))
      .catch(() => setEntityList([]));
  }, [formValues.cb_provider_id, model]);

  const change = useCallback((field, value) => formOptions.change(field, value), [formOptions]);

  if (loading) {
    return <Loading small withOverlay={false} description={__('Loading chargeback options…')} />;
  }
  if (error) {
    return <InlineNotification kind="error" title={error} hideCloseButton />;
  }

  const {
    users = {},
    tenants = {},
    categories = {},
    container_providers: containerProviders = [],
    image_labels: imageLabels = [],
    timezones = [],
  } = cbOpts || {};
  const cbInterval = formValues.cb_interval || 'daily';
  const { endOpts, sizeOpts } = buildCbIntervalOptions(cbInterval);
  const showCostLabel = isMetering ? __('Show usage by') : __('Show Costs by');

  // Build Show Costs By options depending on model
  const buildShowByOpts = () => {
    const none = [__('<Choose>'), ''];
    if (isContainerProject) {
      return [none, [cbOpts.cb_model, 'entity'], [__('Tag'), 'tag']];
    }
    if (isContainerImage) {
      return [none, [cbOpts.cb_model, 'entity'], [__('Tag'), 'tag']];
    }
    if (isVm) {
      return [none, [__('Owner'), 'owner'], [__('Tag'), 'tag'], [__('Tenant'), 'tenant']];
    }
    if (model === 'ChargebackConfiguredSystem') {
      return [none, [__('Tag'), 'tag']];
    }
    return [none, [__('Owner'), 'owner'], [__('Tag'), 'tag'], [cbOpts.cb_model || model, 'entity']];
  };

  const showByOpts = buildShowByOpts();
  const cbShowTyp = formValues.cb_show_typ || '';
  const cbGroupby = formValues.cb_groupby || 'date';
  const cbModel = cbOpts.cb_model || model;

  // Group-by options (mirror HAML)
  const groupByOpts = [
    [`${cbModel} ${__('and Date')}`, 'date'],
    [`${__('Date')} ${__('and')} ${cbModel}`, 'date-first'],
    [__('Date Only'), 'date-only'],
  ];
  if (!isContainerImage) {
    groupByOpts.push([__('Tag'), 'tag']);
  }
  if (isContainerImage) {
    groupByOpts.push([__('Project'), 'project'], [__('Label'), 'label'], [__('Tag'), 'tag']);
  }
  if (isVm) {
    groupByOpts.push([__('Tenant'), 'tenant']);
  }

  const usersList = Object.entries(users).sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase()));
  const tenantsList = Object.entries(tenants).sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase()));
  const catsList = Object.entries(categories).sort((a, b) => a[1].toLowerCase().localeCompare(b[1].toLowerCase()));

  return (
    <>
      {/* Chargeback Resources — mirrors HAML:
          isVm block:       MeteringVm / ChargebackVm → cb_include_metrics (ChargebackVm only) + method_for_allocated_metrics
          isChargeback block: Chargeback* → cumulative_rate_calculation
          Both may be visible simultaneously for ChargebackVm, so they share one section heading. */}
      {(isVm || isChargeback) && (
        <LabeledSection title={__('Chargeback Resources')}>
          {model === 'ChargebackVm' && (
            <FormRow label={__('Include Capacity & Utilization Metrics')}>
              <Toggle
                id="cb_include_metrics"
                labelA={__('No')}
                labelB={__('Yes')}
                toggled={!!formValues.cb_include_metrics}
                onToggle={(checked) => change('cb_include_metrics', checked)}
                hideLabel
              />
            </FormRow>
          )}
          {isVm && (
            <FormRow label={__('Method for allocated metrics')}>
              <Select
                id="method_for_allocated_metrics"
                labelText=""
                hideLabel
                value={formValues.method_for_allocated_metrics || 'avg'}
                onChange={(e) => change('method_for_allocated_metrics', e.target.value)}
              >
                <SelectItem value="max" text={__('Maximum')} />
                <SelectItem value="avg" text={__('Average')} />
              </Select>
            </FormRow>
          )}
          {isChargeback && (
            <FormRow label={__('Include Cumulative Rate Calculation')}>
              <Toggle
                id="cumulative_rate_calculation"
                labelA={__('No')}
                labelB={__('Yes')}
                toggled={!!formValues.cumulative_rate_calculation}
                onToggle={(checked) => change('cumulative_rate_calculation', checked)}
                hideLabel
              />
            </FormRow>
          )}
        </LabeledSection>
      )}

      {/* Chargeback Filters */}
      <LabeledSection title={__('Chargeback Filters')}>
        <FormRow label={showCostLabel}>
          <Select
            id="cb_show_typ"
            labelText=""
            hideLabel
            value={cbShowTyp}
            onChange={(e) => change('cb_show_typ', e.target.value)}
          >
            {showByOpts.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
        </FormRow>

        {/* Cascade: owner */}
        {cbShowTyp === 'owner' && (
          <FormRow label={__('Owner')}>
            <Select
              id="cb_owner_id"
              labelText=""
              hideLabel
              value={formValues.cb_owner_id || ''}
              onChange={(e) => change('cb_owner_id', e.target.value)}
            >
              <SelectItem value="" text={__('<Choose an Owner>')} />
              {usersList.map(([userid, name]) => (
                <SelectItem key={userid} value={userid} text={name} />
              ))}
            </Select>
          </FormRow>
        )}

        {/* Cascade: tenant */}
        {cbShowTyp === 'tenant' && (
          <FormRow label={__('Tenant')}>
            <Select
              id="cb_tenant_id"
              labelText=""
              hideLabel
              value={formValues.cb_tenant_id || ''}
              onChange={(e) => change('cb_tenant_id', e.target.value)}
            >
              <SelectItem value="" text={__('<Choose a Tenant>')} />
              {tenantsList.map(([id, name]) => (
                <SelectItem key={id} value={id} text={name} />
              ))}
            </Select>
          </FormRow>
        )}

        {/* Cascade: tag — multi-select matching HAML behaviour */}
        {cbShowTyp === 'tag' && (
          <>
            <FormRow label={__('Tag Category')}>
              <Select
                id="cb_tag_cat"
                labelText=""
                hideLabel
                value={formValues.cb_tag_cat || ''}
                onChange={(e) => {
                  change('cb_tag_cat', e.target.value);
                  change('cb_tag_value', []);
                }}
              >
                <SelectItem value="" text={__('<Choose a Category>')} />
                {catsList.map(([name, desc]) => (
                  <SelectItem key={name} value={name} text={desc} />
                ))}
              </Select>
            </FormRow>
            {formValues.cb_tag_cat && tagValues.length > 0 && (
              <FormRow label={__('Tag')}>
                <MultiSelect
                  id="cb_tag_value"
                  titleText=""
                  hideLabel
                  label={__('<Choose Values>')}
                  items={tagValues.map(([name, desc]) => ({ id: name, label: desc }))}
                  initialSelectedItems={
                    (Array.isArray(formValues.cb_tag_value) ? formValues.cb_tag_value : [])
                      .map((v) => ({ id: v, label: tagValues.find(([n]) => n === v)?.[1] || v }))
                  }
                  itemToString={(item) => item?.label || ''}
                  onChange={({ selectedItems }) => change('cb_tag_value', selectedItems.map((i) => i.id))}
                />
              </FormRow>
            )}
          </>
        )}

        {/* Cascade: entity (provider + entity) */}
        {cbShowTyp === 'entity' && (
          <>
            <FormRow label={__('Provider')}>
              <Select
                id="cb_provider_id"
                labelText=""
                hideLabel
                value={formValues.cb_provider_id || ''}
                onChange={(e) => {
                  change('cb_provider_id', e.target.value);
                  change('cb_entity_id', 'all');
                }}
              >
                <SelectItem value="" text={__('<Choose Provider>')} />
                <SelectItem value="all" text={__('All Providers')} />
                {containerProviders.map(([name, id]) => (
                  <SelectItem key={id} value={id} text={name} />
                ))}
              </Select>
            </FormRow>
            {formValues.cb_provider_id && formValues.cb_provider_id !== 'all' && (
              <FormRow label={cbModel}>
                <Select
                  id="cb_entity_id"
                  labelText=""
                  hideLabel
                  value={formValues.cb_entity_id || 'all'}
                  onChange={(e) => change('cb_entity_id', e.target.value)}
                >
                  <SelectItem value="" text={__('<Choose Entity>')} />
                  <SelectItem value="all" text={__('All Entities')} />
                  {entityList.map(([name, id]) => (
                    <SelectItem key={id} value={id} text={name} />
                  ))}
                </Select>
              </FormRow>
            )}
          </>
        )}

        {/* Group by */}
        <FormRow label={__('Group by')}>
          <Select
            id="cb_groupby"
            labelText=""
            hideLabel
            value={cbGroupby === 'vm' ? 'date' : cbGroupby}
            onChange={(e) => change('cb_groupby', e.target.value)}
          >
            {groupByOpts.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
        </FormRow>

        {cbGroupby === 'tag' && (
          <FormRow label={__('Group by Tag')}>
            <MultiSelect
              id="cb_groupby_tag"
              titleText=""
              hideLabel
              label={__('<Choose Categories>')}
              items={catsList.map(([name, desc]) => ({ id: name, label: desc }))}
              initialSelectedItems={
                (Array.isArray(formValues.cb_groupby_tag) ? formValues.cb_groupby_tag : [])
                  .map((v) => ({ id: v, label: catsList.find(([n]) => n === v)?.[1] || v }))
              }
              itemToString={(item) => item?.label || ''}
              onChange={({ selectedItems }) => change('cb_groupby_tag', selectedItems.map((i) => i.id))}
            />
          </FormRow>
        )}

        {cbGroupby === 'label' && (
          <FormRow label={__('Group by Label')}>
            <Select
              id="cb_groupby_label"
              labelText=""
              hideLabel
              value={formValues.cb_groupby_label || ''}
              onChange={(e) => change('cb_groupby_label', e.target.value)}
            >
              <SelectItem value="" text={__('<Choose a Label>')} />
              {imageLabels.map((l) => (
                <SelectItem key={l} value={l} text={l} />
              ))}
            </Select>
          </FormRow>
        )}
      </LabeledSection>

      {/* Chargeback Interval */}
      <LabeledSection title={__('Chargeback Interval')}>
        <FormRow label={showCostLabel}>
          <Select
            id="cb_interval"
            labelText=""
            hideLabel
            value={cbInterval}
            onChange={(e) => change('cb_interval', e.target.value)}
          >
            <SelectItem value="daily" text={__('Day')} />
            <SelectItem value="weekly" text={__('Week')} />
            <SelectItem value="monthly" text={__('Month')} />
          </Select>
        </FormRow>

        <FormRow label={`${cbInterval.charAt(0).toUpperCase() + cbInterval.slice(1)} ${__('Ending with')}`}>
          <div className="report-editor-row__content--flex-center">
            <Select
              id="cb_end_interval_offset"
              labelText=""
              hideLabel
              value={String(formValues.cb_end_interval_offset ?? 1)}
              onChange={(e) => change('cb_end_interval_offset', parseInt(e.target.value, 10))}
            >
              {endOpts.map(([label, value]) => (
                <SelectItem key={value} value={String(value)} text={label} />
              ))}
            </Select>
            <span className="report-editor-filter__going-back">{__('going back')}</span>
            <Select
              id="cb_interval_size"
              labelText=""
              hideLabel
              value={String(formValues.cb_interval_size ?? 1)}
              onChange={(e) => change('cb_interval_size', parseInt(e.target.value, 10))}
            >
              {sizeOpts.map(([label, value]) => (
                <SelectItem key={value} value={String(value)} text={label} />
              ))}
            </Select>
          </div>
        </FormRow>

        <FormRow label={__('Time Zone')}>
          <Select
            id="tz"
            labelText=""
            hideLabel
            value={formValues.tz || ''}
            onChange={(e) => change('tz', e.target.value)}
          >
            <SelectItem value="" text={__('<Choose>')} />
            {timezones.map(([label, value]) => (
              <SelectItem key={value} value={value} text={label} />
            ))}
          </Select>
        </FormRow>
      </LabeledSection>
    </>
  );
};

ChargebackFilter.propTypes = {
  formValues: PropTypes.shape({}).isRequired,
  formOptions: PropTypes.shape({ change: PropTypes.func }).isRequired,
  model: PropTypes.string.isRequired,
};

// ---------------------------------------------------------------------------
// FilterTab — top-level dispatcher
// ---------------------------------------------------------------------------

// FilterTab is a pure display component — it just dispatches to the correct
// filter variant based on reportType. The reportType is driven by the parent
// ReportEditor via onStateChange, so no callbacks are needed here.
const FilterTab = ({ reportType, input }) => {
  useFieldApi(input || { name: 'filter_tab_content' }); // bind DDF field
  const formOptions = useFormApi();
  // Subscribe to every field read as a controlled-input value so FilterTab
  // (and its sub-components) re-renders when any of them change.
  // Without these subscriptions formOptions.getState() returns a stale snapshot
  // and dropdowns/toggles appear to do nothing.
  const { input: { value: modelRaw = '' } } = useFieldApi({ name: 'model' });
  const { input: { value: colOrder = [] } } = useFieldApi({ name: 'col_order' });
  // Performance / trend fields
  useFieldApi({ name: 'perf_interval' });
  useFieldApi({ name: 'perf_end' });
  useFieldApi({ name: 'perf_start' });
  // Chargeback fields
  useFieldApi({ name: 'cb_show_typ' });
  useFieldApi({ name: 'cb_owner_id' });
  useFieldApi({ name: 'cb_tenant_id' });
  useFieldApi({ name: 'cb_tag_cat' });
  useFieldApi({ name: 'cb_tag_value' });
  useFieldApi({ name: 'cb_provider_id' });
  useFieldApi({ name: 'cb_entity_id' });
  useFieldApi({ name: 'cb_groupby' });
  useFieldApi({ name: 'cb_groupby_tag' });
  useFieldApi({ name: 'cb_groupby_label' });
  useFieldApi({ name: 'cb_interval' });
  useFieldApi({ name: 'cb_interval_size' });
  useFieldApi({ name: 'cb_end_interval_offset' });
  useFieldApi({ name: 'tz' });
  useFieldApi({ name: 'cb_include_metrics' });
  useFieldApi({ name: 'method_for_allocated_metrics' });
  useFieldApi({ name: 'cumulative_rate_calculation' });

  const model = modelRaw?.value ?? modelRaw;
  const formValues = { ...formOptions.getState().values, model, col_order: colOrder };

  switch (reportType) {
    case 'trend':
      return <TrendFilter formValues={formValues} formOptions={formOptions} />;
    case 'performance':
      return <PerformanceFilter formValues={formValues} formOptions={formOptions} />;
    case 'chargeback':
      return model
        ? <ChargebackFilter formValues={formValues} formOptions={formOptions} model={model} />
        : <p className="report-editor-filter__text-muted">{__('Select a model on the Columns tab to configure chargeback filters.')}</p>;
    case 'standard':
    default:
      return <StandardFilter formValues={formValues} formOptions={formOptions} />;
  }
};

FilterTab.propTypes = {
  reportType: PropTypes.oneOf(['standard', 'performance', 'trend', 'chargeback']),
  input: PropTypes.shape({}),
};

export default FilterTab;
