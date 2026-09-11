import {
  Accordion,
  AccordionItem,
  Select,
  SelectItem,
  Tag,
  TextInput,
} from '@carbon/react';
import { useFormApi, useFieldApi } from '@@ddf';
import type { FormOptions } from '@data-driven-forms/react-form-renderer/renderer-context';
import { FormRow } from '../form-row';
import { buildLabelMap, getColumnMeta } from '../utils';
import { useFieldMetadata } from '../field-metadata-context';
import type {
  ColOptions, FieldMeta, FormData, ReportFormValues, StyleRule,
} from '../report-editor-types';

const MAX_RULES = 3;
const DEFAULT_OPERATOR = 'DEFAULT';
const STYLE_OPERATORS = ['DEFAULT', '=', '!=', '<', '<=', '>', '>=', 'INCLUDES', 'IS NULL', 'IS NOT NULL'];
const NOTHING_STYLE = '';
const DATE_VALUE_OPTIONS = [
  'Today',
  'Yesterday',
  'Last 2 Days',
  'Last 7 Days',
  'Last 30 Days',
  'This Week',
  'This Month',
  'This Quarter',
  'This Year',
];

type FormOptionsApi = FormOptions<Record<string, unknown>>;

const getColumnStyles = (formValues: ReportFormValues, fieldId: string): StyleRule[] =>
  formValues.col_options?.[fieldId]?.style || [];
const hasConfiguredRule = (rule: StyleRule = {}): boolean => !!rule.class;
const isNullOperator = (operator = ''): boolean => operator.includes('NULL') || operator.includes('EMPTY');

const normalizeStyleOptions = (styleClasses: Record<string, string> = {}): [string, string][] => [
  [__('Normal'), NOTHING_STYLE],
  ...Object.entries(styleClasses).map(([value, label]) => [label, value] as [string, string]),
];

const getRuleCount = (rules: StyleRule[] = []): number => rules.filter(hasConfiguredRule).length;

const getDefaultValue = (columnMeta: FieldMeta, operator: string): string => {
  if (operator === DEFAULT_OPERATOR || isNullOperator(operator)) {
    return '';
  }

  if (columnMeta.data_type === 'boolean') {
    return 'true';
  }

  if (['datetime', 'date'].includes(columnMeta.format_sub_type || '') || ['datetime', 'date'].includes(columnMeta.data_type || '')) {
    return DATE_VALUE_OPTIONS[0];
  }

  return '';
};

const updateStyleRule = (
  formOptions: FormOptionsApi,
  formValues: ReportFormValues,
  fieldId: string,
  index: number,
  updates: Partial<StyleRule>,
) => {
  const rules = [...getColumnStyles(formValues, fieldId)];
  const nextRule: StyleRule = {
    ...(rules[index] || {}),
    ...updates,
  };

  if (!nextRule.class) {
    rules.splice(index, 1);
  } else {
    rules[index] = nextRule;
  }

  formOptions.change(`col_options.${fieldId}.style`, rules);
};

type StyleValueInputProps = {
  fieldId: string;
  index: number;
  operator: string;
  rule: StyleRule;
  columnMeta: FieldMeta;
  formOptions: FormOptionsApi;
};

const StyleValueInput = ({
  fieldId, index, operator, rule, columnMeta, formOptions,
}: StyleValueInputProps) => {
  if (operator === DEFAULT_OPERATOR || isNullOperator(operator)) {
    return null;
  }

  if (columnMeta.data_type === 'boolean') {
    return (
      <Select
        id={`style-value-${fieldId}-${index}`}
        labelText=""
        hideLabel
        value={String(rule.value ?? 'true')}
        onChange={(e) => formOptions.change(`col_options.${fieldId}.style.${index}.value`, e.target.value)}
      >
        <SelectItem value="true" text={__('true')} />
        <SelectItem value="false" text={__('false')} />
      </Select>
    );
  }

  if (['datetime', 'date'].includes(columnMeta.format_sub_type || '') || ['datetime', 'date'].includes(columnMeta.data_type || '')) {
    return (
      <Select
        id={`style-value-${fieldId}-${index}`}
        labelText=""
        hideLabel
        value={rule.value || DATE_VALUE_OPTIONS[0]}
        onChange={(e) => formOptions.change(`col_options.${fieldId}.style.${index}.value`, e.target.value)}
      >
        {DATE_VALUE_OPTIONS.map((value) => <SelectItem key={value} value={value} text={__(value)} />)}
      </Select>
    );
  }

  // Numeric / text field — may also have units
  const units = columnMeta.units || [];
  return (
    <div className="report-editor-styling__value-with-units">
      <TextInput
        id={`style-value-${fieldId}-${index}`}
        labelText=""
        hideLabel
        value={rule.value || ''}
        onChange={(e) => formOptions.change(`col_options.${fieldId}.style.${index}.value`, e.target.value)}
      />
      {units.length > 0 && (
        <Select
          id={`style-suffix-${fieldId}-${index}`}
          labelText=""
          hideLabel
          value={rule.value_suffix || units[0][1] || ''}
          onChange={(e) => formOptions.change(`col_options.${fieldId}.style.${index}.value_suffix`, e.target.value)}
        >
          {units.map(([label, val]) => <SelectItem key={val} value={val} text={label} />)}
        </Select>
      )}
    </div>
  );
};

type StyleRuleEditorProps = {
  fieldId: string;
  index: number;
  rule: StyleRule;
  columnMeta: FieldMeta;
  styleOptions: [string, string][];
  formOptions: FormOptionsApi;
  formValues: ReportFormValues;
};

const StyleRuleEditor = ({
  fieldId,
  index,
  rule,
  columnMeta,
  styleOptions,
  formOptions,
  formValues,
}: StyleRuleEditorProps) => {
  const selectedClass = rule.class || NOTHING_STYLE;
  const selectedOperator = rule.operator || DEFAULT_OPERATOR;

  return (
    <div className={`report-editor-styling__rule-container ${index > 0 ? 'report-editor-styling__rule-container--bordered' : ''}`}>
      <h5 className="report-editor-styling__rule-heading">{sprintf(__('Rule %s'), index + 1)}</h5>
      <FormRow label={__('Style')}>
        <Select
          id={`style-class-${fieldId}-${index}`}
          labelText=""
          hideLabel
          value={selectedClass}
          onChange={(e) => {
            const nextClass = e.target.value;
            updateStyleRule(formOptions, formValues, fieldId, index, {
              class: nextClass || undefined,
              operator: nextClass ? (rule.operator || DEFAULT_OPERATOR) : undefined,
              value: nextClass ? (rule.value ?? getDefaultValue(columnMeta, rule.operator || DEFAULT_OPERATOR)) : undefined,
            });
          }}
        >
          {styleOptions.map(([label, value]) => <SelectItem key={value || 'normal'} value={value} text={label} />)}
        </Select>
      </FormRow>

      {selectedClass && (
        <>
          <FormRow label={__('If')}>
            <Select
              id={`style-operator-${fieldId}-${index}`}
              labelText=""
              hideLabel
              value={selectedOperator}
              onChange={(e) => {
                const nextOperator = e.target.value;
                updateStyleRule(formOptions, formValues, fieldId, index, {
                  operator: nextOperator,
                  value: getDefaultValue(columnMeta, nextOperator),
                });
              }}
            >
              {STYLE_OPERATORS.map((operator) => <SelectItem key={operator} value={operator} text={__(operator)} />)}
            </Select>
          </FormRow>

          {(selectedOperator !== DEFAULT_OPERATOR && !isNullOperator(selectedOperator)) && (
            <FormRow label={__('Value')}>
              <StyleValueInput
                fieldId={fieldId}
                index={index}
                operator={selectedOperator}
                rule={rule}
                columnMeta={columnMeta}
                formOptions={formOptions}
              />
            </FormRow>
          )}

          <FormRow label={__('Sample')}>
            <Tag type="gray" className={selectedClass}>{__('Sample')}</Tag>
          </FormRow>
        </>
      )}
    </div>
  );
};

type StylingTabProps = {
  formData: Pick<FormData, 'style_classes'>;
};

const StylingTab = ({ formData }: StylingTabProps) => {
  const formOptions = useFormApi();
  // Subscribe to col_order and col_options so the tab re-renders when columns are
  // added/removed AND when style rules change (operator/value fields are conditional
  // on rule.class being set, so StylingTab must re-render when col_options updates).
  const { input: { value: colOrder = [] as string[] } } = useFieldApi({ name: 'col_order' });
  const { input: { value: colOptions = {} as ColOptions } } = useFieldApi({ name: 'col_options' });
  const formValues: ReportFormValues = { ...formOptions.getState().values as ReportFormValues, col_options: colOptions as ColOptions };
  const { availableFields, fieldMetadata } = useFieldMetadata();
  const labelMap = buildLabelMap(availableFields);
  const styleOptions = normalizeStyleOptions(formData.style_classes || {});

  if ((colOrder as string[]).length === 0) {
    return <p>{__('Add columns on the Columns tab to configure styling rules.')}</p>;
  }

  return (
    <div>
      <Accordion>
        {(colOrder as string[]).map((fieldId) => {
          const rules = getColumnStyles(formValues, fieldId);
          const ruleCount = getRuleCount(rules);
          const columnMeta = getColumnMeta(fieldMetadata, fieldId);

          return (
            <AccordionItem
              key={fieldId}
              open={ruleCount > 0}
              title={(
                <div className="report-editor-styling__accordion-title">
                  <span>{labelMap[fieldId] || fieldId}</span>
                  {ruleCount > 0 && (
                    <span className="report-editor-styling__accordion-title-count">
                      {sprintf(ruleCount === 1 ? __('%s rule') : __('%s rules'), ruleCount)}
                    </span>
                  )}
                </div>
              )}
            >
              {Array.from({ length: MAX_RULES }, (_, index) => {
                if (index > 0 && !hasConfiguredRule(rules[index - 1])) {
                  return null;
                }

                return (
                  <StyleRuleEditor
                    key={`${fieldId}-${index}`}
                    fieldId={fieldId}
                    index={index}
                    rule={rules[index] || {}}
                    columnMeta={columnMeta}
                    styleOptions={styleOptions}
                    formOptions={formOptions}
                    formValues={formValues}
                  />
                );
              })}
            </AccordionItem>
          );
        })}
      </Accordion>

      <p className="report-editor-styling__footer-text">
        {__('Style conditions are evaluated top to bottom for each column')}
      </p>
    </div>
  );
};

export default StylingTab;
