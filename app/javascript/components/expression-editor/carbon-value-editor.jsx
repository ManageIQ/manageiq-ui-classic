// Carbon Design System valueEditor slot for react-querybuilder v8.
// Handles: text, date, select, multiselect, checkbox, __tag__:*, __regkey__, __find__:*
import { useState, useEffect } from 'react';
import {
  Checkbox,
  MultiSelect,
  Select,
  SelectItem,
  TextInput,
} from '@carbon/react';
import DateValueEditor from './date-value-editor';
import FindValueEditor from './find-value-editor';

// Flatten RQB option lists (flat or optgroup).
const flatOptions = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.flatMap((o) => (o.options ? o.options : [o]));
};

// Fetches tag values from GET /expression_editor/tag_values and renders a Select.
const TagValueSelect = ({
  tagPath,
  value,
  disabled,
  id,
  handleOnChange,
}) => {
  const [tagValues, setTagValues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tagPath) {
      return;
    }
    setLoading(true);
    http.get(`/expression_editor/tag_values?tag=${encodeURIComponent(tagPath)}`)
      .then((data) => {
        // Server returns { tag_values: [[label, value], ...] }
        let raw = [];
        if (Array.isArray(data)) {
          raw = data;
        } else if (data && Array.isArray(data.tag_values)) {
          raw = data.tag_values;
        }
        const items = raw.map((entry) => (Array.isArray(entry)
          ? { label: entry[0], name: String(entry[1]) }
          : { label: entry.label, name: String(entry.value ?? entry.name) }));
        setTagValues(items);
      })
      .catch(() => setTagValues([]))
      .finally(() => setLoading(false));
  }, [tagPath]);

  return (
    <Select
      id={id}
      hideLabel
      labelText={__('Tag value')}
      size="sm"
      value={value ?? ''}
      disabled={disabled || loading}
      onChange={(e) => handleOnChange(e.target.value)}
    >
      <SelectItem value="" text={loading ? __('Loading…') : __('Select a value')} />
      {tagValues.map((tv) => (
        <SelectItem key={tv.name} value={tv.name} text={tv.label} />
      ))}
    </Select>
  );
};

// Compound editor for __regkey__ rules: Key / Value / Operator / Data inputs.
const REGKEY_NO_REGVAL_OPS = new Set(['KEY EXISTS']);
const REGKEY_NO_DATA_OPS = new Set([
  'KEY EXISTS', 'VALUE EXISTS', 'IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY',
]);

const RegkeyValueEditor = ({
  value,
  operator,
  operatorOptions,
  onChangeOperator,
  disabled,
  idBase,
  handleOnChange,
}) => {
  const compound = (value && typeof value === 'object') ? value : {};
  const regkey = compound.regkey ?? '';
  const regval = compound.regval ?? '';
  const data = compound.data ?? '';

  const showRegval = !REGKEY_NO_REGVAL_OPS.has(operator);
  const showData = !REGKEY_NO_DATA_OPS.has(operator);

  const update = (patch) => handleOnChange({
    regkey,
    regval,
    data,
    ...compound,
    ...patch,
  });

  return (
    <div className="exp-regkey-editor">
      <TextInput
        id={`${idBase}-key`}
        hideLabel
        labelText={__('Registry Key')}
        placeholder={__('Key')}
        size="sm"
        value={regkey}
        disabled={disabled}
        onChange={(e) => update({ regkey: e.target.value })}
      />
      {showRegval && (
        <TextInput
          id={`${idBase}-val`}
          hideLabel
          labelText={__('Registry Value')}
          placeholder={__('Value')}
          size="sm"
          value={regval}
          disabled={disabled}
          onChange={(e) => update({ regval: e.target.value })}
        />
      )}
      {operatorOptions && operatorOptions.length > 0 && (
        <Select
          id={`${idBase}-op`}
          hideLabel
          labelText={__('Operator')}
          size="sm"
          value={operator}
          disabled={disabled}
          className="exp-regkey-operator"
          onChange={(e) => onChangeOperator(e.target.value)}
        >
          {operatorOptions.map((o) => (
            <SelectItem
              key={o.name ?? o.value}
              value={o.name ?? o.value}
              text={o.label}
            />
          ))}
        </Select>
      )}
      {showData && (
        <TextInput
          id={`${idBase}-data`}
          hideLabel
          labelText={__('Registry Data')}
          placeholder={__('Data')}
          size="sm"
          value={data}
          disabled={disabled}
          onChange={(e) => update({ data: e.target.value })}
        />
      )}
    </div>
  );
};

// Units suffix: single entry renders a plain label; multiple entries render a Select.
// units shape: [[label, value], ...] or [{label, name}, ...]
const UnitsSuffix = ({
  units,
  unitValue,
  id,
  disabled,
  onChange,
}) => {
  if (!Array.isArray(units) || units.length === 0) {
    return null;
  }

  const items = units.map((u) => (Array.isArray(u)
    ? { label: u[0], name: String(u[1]) }
    : { label: u.label, name: String(u.name ?? u.value) }));

  if (items.length === 1) {
    return <span className="exp-units-label">{items[0].label}</span>;
  }

  return (
    <Select
      id={`${id}-units`}
      hideLabel
      labelText={__('Units')}
      size="sm"
      value={unitValue ?? items[0]?.name ?? ''}
      disabled={disabled}
      className="exp-units-select"
      onChange={(e) => onChange(e.target.value)}
    >
      {items.map((u) => (
        <SelectItem key={u.name} value={u.name} text={u.label} />
      ))}
    </Select>
  );
};

// Parse "42.megabytes" into { amount: "42", unit: "megabytes" } (bytes fields only).
const parseUnitsValue = (value, unitItems) => {
  if (!value || typeof value !== 'string' || unitItems.length === 0) {
    return { amount: value ?? '', unit: unitItems[0]?.name ?? null };
  }
  const dotIdx = value.lastIndexOf('.');
  if (dotIdx === -1) {
    return { amount: value, unit: unitItems[0]?.name ?? null };
  }
  const maybeSuffix = value.slice(dotIdx + 1);
  const matched = unitItems.find((u) => u.name === maybeSuffix);
  if (matched) {
    return { amount: value.slice(0, dotIdx), unit: matched.name };
  }
  return { amount: value, unit: unitItems[0]?.name ?? null };
};

const USER_INPUT_SENTINEL = '__user_input__';

const NO_VALUE_OPERATORS = new Set(['IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY', 'KEY EXISTS', 'VALUE EXISTS']);

// Optional "User will input value" checkbox rendered below the main value editor.
const RuleExtras = ({
  rule, context, disabled, fieldData, operator,
}) => {
  if (!rule || !context) {
    return null;
  }
  const { showUserInput, updateRuleUserInput } = context;
  if (!showUserInput) {
    return null;
  }

  const colType = fieldData && fieldData.colType;

  // regkey and find don't support user-input; neither do no-value operators.
  const canShowUserInput = showUserInput
    && colType !== 'find'
    && colType !== 'regkey'
    && !NO_VALUE_OPERATORS.has(operator);

  if (!canShowUserInput) {
    return null;
  }

  const ruleId = rule.id;
  const isUserInput = rule.value === USER_INPUT_SENTINEL;

  return (
    <div className="exp-rule-extras">
      <Checkbox
        id={`user-input-${ruleId}`}
        labelText={__('User will input value')}
        checked={isUserInput}
        disabled={disabled}
        onChange={(_, { checked }) => {
          if (updateRuleUserInput) {
            updateRuleUserInput(ruleId, checked);
          }
        }}
      />
    </div>
  );
};

const CarbonValueEditor = ({
  value,
  handleOnChange,
  inputType,
  type,        // valueEditorType: "text" | "select" | "multiselect" | "date" | "checkbox"
  values,      // options for select / multiselect
  disabled,
  className,
  title,
  field,
  operator,
  path,
  fieldData,   // full RQB field config entry — carries .units, .colType, etc.
  schema,      // RQB schema — used for operator list / dispatch in regkey editor
  rule,        // full RQB rule — used to read rule.id and rule.dateFormat
  context,     // RQB context — carries updateRuleDateFormat from ExpressionEditor
}) => {
  // No-value operators render nothing except extras. __regkey__ manages its own visibility.
  const noValueOps = [
    'IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY',
    'KEY EXISTS', 'VALUE EXISTS',
  ];
  const skipValueEditor = field !== '__regkey__' && noValueOps.includes(operator);
  const isUserInput = value === USER_INPUT_SENTINEL;
  if (skipValueEditor && !(context && context.showUserInput)) {
    return null;
  }

  const id = `value-${field}-${(path || []).join('-')}`;

  const extras = (
    <RuleExtras
      rule={rule}
      context={context}
      disabled={disabled}
      fieldData={fieldData}
      operator={operator}
    />
  );

  if (skipValueEditor) {
    return <div className={className}>{extras}</div>;
  }

  if (isUserInput) {
    return <div className={className}>{extras}</div>;
  }

  // FIND atom
  if (String(field).startsWith('__find__:')) {
    return (
      <div className={className}>
        <FindValueEditor
          value={value}
          handleOnChange={handleOnChange}
          field={field}
          disabled={disabled}
          path={path}
          context={context}
        />
        {extras}
      </div>
    );
  }

  // Registry key
  if (field === '__regkey__') {
    const opOptions = schema
      ? schema.getOperators(field, { fieldData: fieldData || {} }).flatMap((o) => (o.options ? o.options : [o]))
      : [];

    // schema.actions is not forwarded to valueEditor — patch via schema.getQuery()/dispatchQuery().
    const handleOpChange = (schema && path)
      ? (val) => {
        const patchRules = (rules, remaining) => rules.map((r, idx) => {
          if (idx !== remaining[0]) {
            return r;
          }
          if (remaining.length === 1) {
            return { ...r, operator: val };
          }
          return { ...r, rules: patchRules(r.rules, remaining.slice(1)) };
        });
        const q = schema.getQuery();
        schema.dispatchQuery({ ...q, rules: patchRules(q.rules, path) });
      }
      : () => {};

    return (
      <div className={className}>
        <RegkeyValueEditor
          value={value}
          operator={operator}
          operatorOptions={opOptions}
          onChangeOperator={handleOpChange}
          disabled={disabled}
          idBase={id}
          handleOnChange={handleOnChange}
        />
        {extras}
      </div>
    );
  }

  // Tag value select
  if (String(field).startsWith('__tag__:')) {
    const tagPath = field.slice('__tag__:'.length);
    return (
      <div className={className}>
        <TagValueSelect
          tagPath={tagPath}
          value={value}
          disabled={disabled}
          id={id}
          handleOnChange={handleOnChange}
        />
        {extras}
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div className={className}>
        <Checkbox
          id={id}
          labelText={title || ''}
          checked={!!value}
          disabled={disabled}
          onChange={(_, { checked }) => handleOnChange(checked)}
        />
        {extras}
      </div>
    );
  }

  if (type === 'multiselect') {
    const items = flatOptions(values).map((o) => ({
      id: String(o.name ?? o.value),
      label: o.label,
    }));
    const selectedValues = Array.isArray(value)
      ? value
      : String(value ?? '').split(',');
    const selected = items.filter((i) => selectedValues.includes(i.id));
    return (
      <div className={className}>
        <MultiSelect
          id={id}
          hideLabel
          titleText={title || __('Value')}
          placeholder={__('Select values')}
          size="sm"
          items={items}
          itemToString={(i) => (i ? i.label : '')}
          initialSelectedItems={selected}
          disabled={disabled}
          onChange={({ selectedItems }) => {
            handleOnChange(selectedItems.map((i) => i.id).join(','));
          }}
        />
        {extras}
      </div>
    );
  }

  if (type === 'select') {
    const opts = flatOptions(values);
    return (
      <div className={className}>
        <Select
          id={id}
          hideLabel
          labelText={title || __('Value')}
          size="sm"
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => handleOnChange(e.target.value)}
        >
          {opts.map((o) => (
            <SelectItem
              key={o.name ?? o.value}
              value={String(o.name ?? o.value)}
              text={o.label}
            />
          ))}
        </Select>
        {extras}
      </div>
    );
  }

  if (type === 'date' || type === 'datetime') {
    const isDatetime = (fieldData && fieldData.colType === 'datetime')
      || String(inputType ?? '').includes('datetime');
    const ruleId = rule && rule.id;
    const ruleDateFormat = rule && rule.dateFormat;
    const handleToggleFormat = (newFmt) => {
      if (context && context.updateRuleDateFormat && ruleId) {
        context.updateRuleDateFormat(ruleId, newFmt);
      }
    };
    return (
      <div className={className}>
        <DateValueEditor
          value={value}
          operator={operator}
          dateFormat={ruleDateFormat}
          isDatetime={isDatetime}
          disabled={disabled}
          id={id}
          handleOnChange={handleOnChange}
          onToggleFormat={handleToggleFormat}
        />
        {extras}
      </div>
    );
  }

  // text / number — with optional units suffix (bytes fields) or display-only unit label.
  // fieldData.units: multi-entry → unit IS appended to stored value as "42.megabytes".
  // fieldData.unitLabel: display-only string (e.g. "MB", "%"), never written to storage.
  const rawUnits = fieldData && fieldData.units;
  const unitItems = Array.isArray(rawUnits)
    ? rawUnits.map((u) => (Array.isArray(u)
      ? { label: u[0], name: String(u[1]) }
      : { label: u.label, name: String(u.name ?? u.value) }))
    : [];
  const hasUnits = unitItems.length > 0;
  const unitLabel = (fieldData && fieldData.unitLabel) || null;

  const { amount, unit } = hasUnits
    ? parseUnitsValue(value, unitItems)
    : { amount: value ?? '', unit: null };

  const assembleValue = (newAmount, newUnit) => (newUnit ? `${newAmount}.${newUnit}` : newAmount);

  const textPlaceholder = (fieldData && fieldData.placeholder)
    || (inputType === 'number' ? __('Enter a number') : __('Enter a value'));

  return (
    <div className={className}>
      <div className={`exp-value-with-units${(hasUnits || unitLabel) ? ' exp-value-with-units--has-units' : ''}`}>
        <TextInput
          id={id}
          hideLabel
          labelText={title || __('Value')}
          placeholder={textPlaceholder}
          size="sm"
          type={inputType === 'number' ? 'number' : 'text'}
          value={hasUnits ? amount : (value ?? '')}
          disabled={disabled}
          onChange={(e) => handleOnChange(hasUnits ? assembleValue(e.target.value, unit) : e.target.value)}
        />
        {hasUnits && (
          <UnitsSuffix
            units={rawUnits}
            unitValue={unit}
            id={id}
            disabled={disabled}
            onChange={(newUnit) => handleOnChange(assembleValue(amount, newUnit))}
          />
        )}
        {unitLabel && !hasUnits && (
          <span className="exp-units-label">{unitLabel}</span>
        )}
      </div>
      {extras}
    </div>
  );
};

export default CarbonValueEditor;
