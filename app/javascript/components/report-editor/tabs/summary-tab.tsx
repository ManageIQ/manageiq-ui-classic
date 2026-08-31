import {
  Accordion,
  AccordionItem,
  Checkbox,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Toggle,
} from '@carbon/react';
import { useFormApi, useFieldApi } from '@@ddf';
import type { FormOptions } from '@data-driven-forms/react-form-renderer/renderer-context';
import { FormRow } from '../form-row';
import { NOTHING, buildLabelMap, getColumnMeta } from '../utils';
import { useFieldMetadata } from '../field-metadata-context';
import type { ColOptions, ReportFormValues } from '../report-editor-types';

const GROUPING_OPTIONS = ['avg', 'max', 'min', 'sum'];
const PIVOT_OPTIONS = ['avg', 'max', 'min', 'sum', 'first', 'last'];
const ROW_LIMIT_OPTIONS = ['', '5', '10', '20', '50', '100'];

type NumericColumn = { fieldId: string; label: string };

const normalizeSelected = (items: unknown[] = []): string[] => items.map((item) => String(item));

const getSortOptions = (colOrder: string[] = [], labelMap: Record<string, string> = {}): [string, string][] => [
  [__('Nothing'), NOTHING],
  ...colOrder.map((fieldId) => [labelMap[fieldId] || fieldId, fieldId] as [string, string]),
];

const getNumericColumns = (
  colOrder: string[] = [],
  fieldMetadata: Record<string, unknown> = {},
  labelMap: Record<string, string> = {},
): NumericColumn[] => colOrder
  .filter((fieldId) => getColumnMeta(fieldMetadata as Parameters<typeof getColumnMeta>[0], fieldId).numeric)
  .map((fieldId) => ({ fieldId, label: labelMap[fieldId] || fieldId }));

const getSuffixOptions = (
  fieldMetadata: Parameters<typeof getColumnMeta>[0],
  fieldId: string,
): [string, string][] => {
  const suffixes = getColumnMeta(fieldMetadata, fieldId).break_suffixes || [];
  return [['', __('Original Value')], ...suffixes.map(([label, value]) => [String(value), label] as [string, string])];
};

const getFormatOptions = (
  fieldMetadata: Parameters<typeof getColumnMeta>[0],
  fieldId: string,
): [string, string][] => {
  const formats = getColumnMeta(fieldMetadata, fieldId).available_formats || [];
  return [
    ['_none_', __('None')],
    ['', __('Reset to Default')],
    ...formats.map(([label, value]) => [String(value), label] as [string, string]),
  ];
};

const renderCalculationTable = (
  title: string | null,
  columns: NumericColumn[],
  selectedMap: Record<string, string[]>,
  options: string[],
  onToggle: (fieldId: string, option: string, checked: boolean) => void,
) => {
  if (columns.length === 0) {
    return <p>{__('No numeric columns available.')}</p>;
  }

  return (
    <div className="report-editor-section">
      {title && <h4 className="report-editor-section__heading">{title}</h4>}
      <Table size="sm">
        <TableHead>
          <TableRow>
            <TableHeader>{__('Column Name')}</TableHeader>
            {options.map((option) => (
              <TableHeader key={option}>{option.toUpperCase()}</TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {columns.map(({ fieldId, label }) => {
            const selected = normalizeSelected(selectedMap[fieldId]);
            return (
              <TableRow key={fieldId}>
                <TableCell>{label}</TableCell>
                {options.map((option) => (
                  <TableCell key={option}>
                    <Checkbox
                      id={`${title || 'calc'}-${fieldId}-${option}`}
                      labelText=""
                      checked={selected.includes(option)}
                      onChange={(_: unknown, { checked }: { checked: boolean }) => onToggle(fieldId, option, checked)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const SummaryTab = () => {
  const formOptions = useFormApi();
  // Subscribe to every field used as a controlled-input value so the component
  // re-renders when any of them change — otherwise dropdowns snap back.
  const { input: { value: colOrder = [] as string[] } } = useFieldApi({ name: 'col_order' });
  const { input: { value: sortby = [] as string[] } } = useFieldApi({ name: 'sortby' });
  const { input: { value: group = 'No' } } = useFieldApi({ name: 'group' });
  const { input: { value: order = 'Ascending' } } = useFieldApi({ name: 'order' });
  const { input: { value: hideDetails = false } } = useFieldApi({ name: 'hide_details' });
  const { input: { value: breakFormat = '' } } = useFieldApi({ name: 'break_format' });
  const { input: { value: sort1Suffix = '' } } = useFieldApi({ name: 'sort1_suffix' });
  const { input: { value: sort2Suffix = '' } } = useFieldApi({ name: 'sort2_suffix' });
  const { input: { value: rowLimit = '' } } = useFieldApi({ name: 'row_limit' });
  const { input: { value: pivotBy1Raw = NOTHING } } = useFieldApi({ name: 'pivot_by1' });
  const { input: { value: pivotBy2Raw = NOTHING } } = useFieldApi({ name: 'pivot_by2' });
  const { input: { value: pivotBy3Raw = NOTHING } } = useFieldApi({ name: 'pivot_by3' });
  const formValues = formOptions.getState().values as ReportFormValues;
  const { availableFields, fieldMetadata } = useFieldMetadata();

  const labelMap = buildLabelMap(availableFields);
  const sortOptions = getSortOptions(colOrder as string[], labelMap);
  const numericColumns = getNumericColumns(colOrder as string[], fieldMetadata, labelMap);

  const sortby1 = (sortby as string[])[0] || NOTHING;
  const sortby2 = (sortby as string[])[1] || NOTHING;
  const hasPrimarySort = sortby1 && sortby1 !== NOTHING;
  const hasGroupBreaks = hasPrimarySort && group !== 'No';

  const breakSuffixes1 = hasPrimarySort ? getSuffixOptions(fieldMetadata, sortby1) : [];
  const breakSuffixes2 = sortby2 && sortby2 !== NOTHING ? getSuffixOptions(fieldMetadata, sortby2) : [];
  const breakFormats = hasPrimarySort ? getFormatOptions(fieldMetadata, sortby1) : [];
  const showBreakFormat = breakFormats.length > 2;

  const updateSort = (index: number, value: string) => {
    const next = [...(sortby as string[])];
    next[index] = value;
    if (index === 0 && value === NOTHING) {
      next[1] = NOTHING;
      formOptions.change('group', 'No');
    }
    formOptions.change('sortby', next);
  };

  const updateGrouping = (fieldId: string, option: string, checked: boolean) => {
    const colOpts = formValues.col_options || {} as ColOptions;
    const current = normalizeSelected(colOpts[fieldId]?.grouping);
    const nextGrouping = checked ? [...new Set([...current, option])] : current.filter((item) => item !== option);
    formOptions.change(`col_options.${fieldId}.grouping`, nextGrouping);
  };

  const pivotBy1 = (pivotBy1Raw as string) || NOTHING;
  const pivotBy2 = (pivotBy2Raw as string) || NOTHING;
  const pivotBy3 = (pivotBy3Raw as string) || NOTHING;
  const pivotColumns = [pivotBy1, pivotBy2, pivotBy3].filter((value) => value && value !== NOTHING);
  const availablePivotColumns = numericColumns.filter(({ fieldId }) => !pivotColumns.includes(fieldId));

  const updatePivot = (field: string, value: string, resets: string[] = []) => {
    formOptions.change(field, value);
    resets.forEach((resetField) => formOptions.change(resetField, NOTHING));
  };

  const updatePivotCalc = (fieldId: string, option: string, checked: boolean) => {
    const current = normalizeSelected(formValues.pivot_cols?.[fieldId]);
    const nextValue = checked ? [...new Set([...current, option])] : current.filter((item) => item !== option);
    formOptions.change(`pivot_cols.${fieldId}`, nextValue);
  };

  if ((colOrder as string[]).length === 0) {
    return <p>{__('Add columns on the Columns tab to configure summary options.')}</p>;
  }

  return (
    <div>
      <div className="report-editor-section">
        <h4 className="report-editor-section__heading">{__('Sort Criteria')}</h4>
        <FormRow label={__('Sort by')}>
          <div className="report-editor-inline-group">
            <Select id="summary-sort-1" labelText="" hideLabel value={sortby1} onChange={(e) => updateSort(0, e.target.value)}>
              {sortOptions.map(([label, value]) => <SelectItem key={value} value={value} text={label} />)}
            </Select>
            {hasPrimarySort && breakSuffixes1.length > 1 && (
              <Select
                id="summary-sort-1-suffix"
                labelText=""
                hideLabel
                value={sort1Suffix as string}
                onChange={(e) => formOptions.change('sort1_suffix', e.target.value)}
              >
                {breakSuffixes1.map(([value, label]) => <SelectItem key={value || 'original'} value={value} text={label} />)}
              </Select>
            )}
          </div>
        </FormRow>

        {hasPrimarySort && (
          <>
            <FormRow label={__('Sort Order')}>
              <Select id="summary-order" labelText="" hideLabel value={order as string} onChange={(e) => formOptions.change('order', e.target.value)}>
                <SelectItem value="Ascending" text={__('Ascending')} />
                <SelectItem value="Descending" text={__('Descending')} />
              </Select>
            </FormRow>
            <FormRow label={__('Show Sort Breaks')}>
              <Select id="summary-group" labelText="" hideLabel value={group as string} onChange={(e) => formOptions.change('group', e.target.value)}>
                <SelectItem value="No" text={__('No')} />
                <SelectItem value="Yes" text={__('Yes')} />
                <SelectItem value="Counts" text={__('Counts')} />
              </Select>
            </FormRow>
            {hasGroupBreaks && (
              <>
                <FormRow label={__('Hide Detail Rows')}>
                  <Toggle
                    id="summary-hide-details"
                    labelA={__('No')}
                    labelB={__('Yes')}
                    toggled={!!hideDetails}
                    onToggle={(checked: boolean) => formOptions.change('hide_details', checked)}
                    hideLabel
                  />
                </FormRow>
                {showBreakFormat && (
                  <FormRow label={__('Format on Summary Row')}>
                    <Select
                      id="summary-break-format"
                      labelText=""
                      hideLabel
                      value={breakFormat as string}
                      onChange={(e) => formOptions.change('break_format', e.target.value)}
                    >
                      {breakFormats.map(([value, label]) => <SelectItem key={value || 'default'} value={value} text={label} />)}
                    </Select>
                  </FormRow>
                )}
              </>
            )}
            <FormRow label={__('Within above field, sort by')}>
              <div className="report-editor-inline-group">
                <Select id="summary-sort-2" labelText="" hideLabel value={sortby2} onChange={(e) => updateSort(1, e.target.value)}>
                  {sortOptions.filter(([, value]) => value === NOTHING || value !== sortby1).map(([label, value]) => (
                    <SelectItem key={value} value={value} text={label} />
                  ))}
                </Select>
                {sortby2 !== NOTHING && breakSuffixes2.length > 1 && (
                  <Select
                    id="summary-sort-2-suffix"
                    labelText=""
                    hideLabel
                    value={sort2Suffix as string}
                    onChange={(e) => formOptions.change('sort2_suffix', e.target.value)}
                  >
                    {breakSuffixes2.map(([value, label]) => <SelectItem key={value || 'original'} value={value} text={label} />)}
                  </Select>
                )}
              </div>
            </FormRow>
            <FormRow label={__('Number of Rows to Show')}>
              {hasGroupBreaks ? __('All') : (
                <Select
                  id="summary-row-limit"
                  labelText=""
                  hideLabel
                  value={(rowLimit as string) ?? ''}
                  onChange={(e) => formOptions.change('row_limit', e.target.value)}
                >
                  {ROW_LIMIT_OPTIONS.map((value) => (
                    <SelectItem key={value || 'all'} value={value} text={value === '' ? __('All') : sprintf(__('First %s'), value)} />
                  ))}
                </Select>
              )}
            </FormRow>
          </>
        )}
      </div>

      {hasGroupBreaks && renderCalculationTable(
        __('Break Calculations'),
        numericColumns,
        Object.fromEntries(
          Object.entries(formValues.col_options || {} as ColOptions).map(([k, v]) => [k, v?.grouping || []]),
        ),
        GROUPING_OPTIONS,
        updateGrouping,
      )}

      <Accordion>
        <AccordionItem title={__('Group Records (Consolidation)')}>
          <div className="report-editor-summary__group-title">
            <FormRow label={__('Group by Column 1')}>
              <Select
                id="summary-pivot-1"
                labelText=""
                hideLabel
                value={pivotBy1}
                onChange={(e) => updatePivot('pivot_by1', e.target.value, ['pivot_by2', 'pivot_by3'])}
              >
                {sortOptions.map(([label, value]) => <SelectItem key={value} value={value} text={label} />)}
              </Select>
            </FormRow>
            {pivotBy1 !== NOTHING && (
              <FormRow label={__('Group by Column 2')}>
                <Select
                  id="summary-pivot-2"
                  labelText=""
                  hideLabel
                  value={pivotBy2}
                  onChange={(e) => updatePivot('pivot_by2', e.target.value, ['pivot_by3'])}
                >
                  {sortOptions
                    .filter(([, value]) => value === NOTHING || value !== pivotBy1)
                    .map(([label, value]) => <SelectItem key={value} value={value} text={label} />)}
                </Select>
              </FormRow>
            )}
            {pivotBy2 !== NOTHING && (
              <FormRow label={__('Group by Column 3')}>
                <Select
                  id="summary-pivot-3"
                  labelText=""
                  hideLabel
                  value={pivotBy3}
                  onChange={(e) => formOptions.change('pivot_by3', e.target.value)}
                >
                  {sortOptions
                    .filter(([, value]) => value === NOTHING || ![pivotBy1, pivotBy2].includes(value))
                    .map(([label, value]) => <SelectItem key={value} value={value} text={label} />)}
                </Select>
              </FormRow>
            )}
            <p>{__('Consolidating records will not show detail records')}</p>
            {pivotBy1 !== NOTHING && renderCalculationTable(
              __('Grouped Record Calculations'),
              availablePivotColumns,
              formValues.pivot_cols || {},
              PIVOT_OPTIONS,
              updatePivotCalc,
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SummaryTab;
