// Compound value editor for __find__:<field> rules (MiqExpression FIND atom).
// The FIND atom has two sub-clauses:
//   search — a field comparison: operator Select + value input
//   check  — aggregation mode: checkall / checkany / checkcount,
//             with a check-field Select, operator, and optional value input
import { useState, useEffect } from 'react';
import { Select, SelectItem, TextInput } from '@carbon/react';
import DateValueEditor from './date-value-editor';

const toOp = (name) => ({ name, label: name });

// Fallback operator lists when the server call fails.
const FIND_FALLBACK_OPS = {
  string: ['=', '!=', 'STARTS WITH', 'ENDS WITH', 'INCLUDES', 'IS NULL', 'IS NOT NULL'].map(toOp),
  integer: ['=', '!=', '<', '<=', '>=', '>', 'IS NULL', 'IS NOT NULL'].map(toOp),
  float: ['=', '!=', '<', '<=', '>=', '>', 'IS NULL', 'IS NOT NULL'].map(toOp),
  boolean: ['=', 'IS NULL', 'IS NOT NULL'].map(toOp),
  date: ['IS', 'BEFORE', 'AFTER', 'IS EMPTY', 'IS NOT EMPTY'].map(toOp),
  datetime: ['IS', 'BEFORE', 'AFTER', 'IS EMPTY', 'IS NOT EMPTY'].map(toOp),
  count: ['=', '!=', '<', '<=', '>=', '>'].map(toOp),
};
const FIND_FALLBACK_DEFAULT = FIND_FALLBACK_OPS.string;

const NO_VALUE_OPS = new Set([
  'IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY',
  'KEY EXISTS', 'VALUE EXISTS',
]);

const CHECK_MODES = [
  { name: 'checkall', label: __('Check All') },
  { name: 'checkany', label: __('Check Any') },
  { name: 'checkcount', label: __('Check Count') },
];

// Fetch operator list + col_type for a field path.
const useOperators = (fieldPath) => {
  const [result, setResult] = useState({ ops: null, colType: null });

  useEffect(() => {
    if (!fieldPath) {
      setResult({ ops: FIND_FALLBACK_DEFAULT, colType: 'string' });
      return;
    }
    http.get(`/expression_editor/operators?field=${encodeURIComponent(fieldPath)}`)
      .then((data) => {
        const raw = Array.isArray(data.operators) ? data.operators : [];
        const colType = data.col_type || 'string';
        setResult({
          ops: raw.length ? raw.map(toOp) : (FIND_FALLBACK_OPS[colType] || FIND_FALLBACK_DEFAULT),
          colType,
        });
      })
      .catch(() => setResult({ ops: FIND_FALLBACK_DEFAULT, colType: 'string' }));
  }, [fieldPath]);

  return result;
};

// Fetch check sub-fields (each with col_type) from the server.
const useCheckFields = (model, searchField) => {
  const [checkFields, setCheckFields] = useState(null);

  useEffect(() => {
    if (!model || !searchField) {
      setCheckFields([]);
      return;
    }
    http.get(
      `/expression_editor/find_check_fields?model=${encodeURIComponent(model)}&field=${encodeURIComponent(searchField)}`,
    )
      .then((data) => {
        const raw = Array.isArray(data.fields) ? data.fields : [];
        // Server returns [{ label, name, col_type }, ...]
        setCheckFields(raw.map((entry) => (Array.isArray(entry)
          ? { label: entry[0], name: String(entry[1]), colType: 'string' }
          : { label: entry.label, name: String(entry.name), colType: entry.col_type || 'string' }
        )));
      })
      .catch(() => setCheckFields([]));
  }, [model, searchField]);

  return checkFields;
};

// Renders a DateValueEditor or plain TextInput depending on colType.
const ValueInput = ({
  colType, id, value, operator, disabled, onChange,
}) => {
  if (colType === 'date' || colType === 'datetime') {
    return (
      <DateValueEditor
        id={id}
        value={value}
        operator={operator}
        dateFormat="s"
        isDatetime={colType === 'datetime'}
        disabled={disabled}
        handleOnChange={onChange}
      />
    );
  }
  const placeholder = colType === 'integer' || colType === 'float'
    ? __('Enter a number')
    : __('Enter a value');
  return (
    <TextInput
      id={id}
      hideLabel
      labelText={__('Value')}
      placeholder={placeholder}
      size="sm"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const FindValueEditor = ({
  value,
  handleOnChange,
  field,
  disabled,
  path,
  context,
}) => {
  const searchField = String(field || '').startsWith('__find__:')
    ? field.slice('__find__:'.length)
    : field;

  const model = context && context.model ? context.model : '';

  const compound = (value && typeof value === 'object') ? value : {};
  const skey = compound.skey || '=';
  const svalue = compound.svalue ?? '';
  const check = compound.check || 'checkall';
  const cfield = compound.cfield || '';
  const ckey = compound.ckey || '=';
  const cvalue = compound.cvalue ?? '';

  const update = (patch) => handleOnChange({
    skey, svalue, check, cfield, ckey, cvalue, ...compound, ...patch,
  });

  const idBase = `find-${(path || []).join('-')}`;

  const { ops: searchOps, colType: searchColType } = useOperators(searchField);
  const checkFields = useCheckFields(model, searchField);

  const checkFieldMeta = (checkFields || []).find((f) => f.name === cfield);
  const checkColType = check === 'checkcount' ? 'integer' : (checkFieldMeta?.colType || 'string');

  const checkFieldPath = check === 'checkcount' ? 'count' : cfield;
  const { ops: checkOps } = useOperators(checkFieldPath || null);

  // Keep skey valid when operator list changes.
  useEffect(() => {
    if (!searchOps) {
      return;
    }
    const names = searchOps.map((o) => o.name);
    if (!names.includes(skey)) {
      update({ skey: names[0] || '=' });
    }
  }, [searchOps]);

  useEffect(() => {
    if (!checkOps) {
      return;
    }
    const names = checkOps.map((o) => o.name);
    if (!names.includes(ckey)) {
      update({ ckey: names[0] || '=' });
    }
  }, [checkOps]);

  const isCountMode = check === 'checkcount';
  const showCheckValue = !NO_VALUE_OPS.has(ckey);
  const showSearchValue = !NO_VALUE_OPS.has(skey);

  return (
    <div className="exp-find-editor">
      {/* Row 1: search operator + search value */}
      <div className="exp-find-row">
        <Select
          id={`${idBase}-skey`}
          hideLabel
          labelText={__('Search operator')}
          size="sm"
          value={skey}
          disabled={disabled || !searchOps}
          onChange={(e) => update({ skey: e.target.value })}
        >
          {(searchOps || []).map((o) => (
            <SelectItem key={o.name} value={o.name} text={o.label} />
          ))}
        </Select>

        {showSearchValue && (
          <ValueInput
            colType={searchColType}
            id={`${idBase}-svalue`}
            value={svalue}
            operator={skey}
            disabled={disabled}
            onChange={(v) => update({ svalue: v })}
          />
        )}
      </div>

      {/* Row 2: check mode + check field + check operator + check value */}
      <div className="exp-find-row">
        <Select
          id={`${idBase}-check`}
          hideLabel
          labelText={__('Check mode')}
          size="sm"
          value={check}
          disabled={disabled}
          onChange={(e) => update({ check: e.target.value })}
        >
          {CHECK_MODES.map((m) => (
            <SelectItem key={m.name} value={m.name} text={m.label} />
          ))}
        </Select>

        {!isCountMode && (
          <Select
            id={`${idBase}-cfield`}
            hideLabel
            labelText={__('Check field')}
            size="sm"
            value={cfield}
            disabled={disabled || !checkFields}
            onChange={(e) => update({ cfield: e.target.value })}
          >
            <SelectItem value="" text={checkFields === null ? __('Loading…') : __('Select a field')} />
            {(checkFields || []).map((f) => (
              <SelectItem key={f.name} value={f.name} text={f.label} />
            ))}
          </Select>
        )}

        {(isCountMode || cfield) && (
          <Select
            id={`${idBase}-ckey`}
            hideLabel
            labelText={__('Check operator')}
            size="sm"
            value={ckey}
            disabled={disabled || !checkOps}
            onChange={(e) => update({ ckey: e.target.value })}
          >
            {(checkOps || []).map((o) => (
              <SelectItem key={o.name} value={o.name} text={o.label} />
            ))}
          </Select>
        )}

        {(isCountMode || cfield) && showCheckValue && (
          <ValueInput
            colType={checkColType}
            id={`${idBase}-cvalue`}
            value={cvalue}
            operator={ckey}
            disabled={disabled}
            onChange={(v) => update({ cvalue: v })}
          />
        )}
      </div>
    </div>
  );
};

export default FindValueEditor;
