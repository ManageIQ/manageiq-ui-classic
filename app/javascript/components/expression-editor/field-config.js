/**
 * Converts the server metadata response (GET /expression_editor/metadata)
 * into a react-querybuilder `fields` configuration array.
 */

// ── Operator helpers ──────────────────────────────────────────────────────────

const op = (name) => ({ name, label: name });

// Fallback operator sets for non-field entries (counts, tags, finds, regkey)
// that are not returned by the metadata :fields array.
const FALLBACK_OPERATORS = {
  count: ['=', '!=', '<', '<=', '>=', '>'].map(op),
  tag: [op('CONTAINS')],
  find: [op('FIND')],
  regkey: [
    '=', 'STARTS WITH', 'ENDS WITH', 'INCLUDES', 'REGULAR EXPRESSION MATCHES',
    'REGULAR EXPRESSION DOES NOT MATCH', 'IS NULL', 'IS NOT NULL', 'IS EMPTY',
    'IS NOT EMPTY', 'KEY EXISTS', 'VALUE EXISTS',
  ].map(op),
};

const BOOLEAN_VALUES = [
  { name: 'true', label: __('True') },
  { name: 'false', label: __('False') },
];

const valueEditorTypeForColType = (colType) => {
  if (colType === 'boolean') {
    return 'select';
  }
  if (colType === 'date' || colType === 'datetime') {
    return 'date';
  }
  return 'text';
};

const inputTypeForColType = (colType) => {
  if (colType === 'integer' || colType === 'float') {
    return 'number';
  }
  return 'text';
};

// ── Units configuration ───────────────────────────────────────────────────────

// :bytes stores the unit in the value as "42.megabytes".
// All other sub_types show a display-only label; the value is a plain number string.
const BYTES_UNITS = [
  [__('Bytes'), 'bytes'],
  [__('KB'), 'kilobytes'],
  [__('MB'), 'megabytes'],
  [__('GB'), 'gigabytes'],
  [__('TB'), 'terabytes'],
];

const DISPLAY_ONLY_UNIT_LABEL = {
  megabytes: () => __('MB'),
  megabytes_precision_2: () => __('MB'),
  gigabytes: () => __('GB'),
  kilobytes: () => __('KB'),
  bytes_precision_2: () => __('Bytes'),
  kbps: () => __('KBps'),
  kbps_precision_2: () => __('KBps'),
  mhz: () => __('MHz'),
  mhz_avg: () => __('MHz'),
  percent: () => __('%'),
};

const unitInfoForSubType = (subType) => {
  if (!subType) {
    return { units: null, unitLabel: null };
  }
  if (subType === 'bytes') {
    return { units: BYTES_UNITS, unitLabel: null };
  }
  const labelFn = DISPLAY_ONLY_UNIT_LABEL[subType];
  return labelFn ? { units: null, unitLabel: labelFn() } : { units: null, unitLabel: null };
};

const PLACEHOLDER_BY_COL_TYPE = {
  string_set: () => __('Enter a list of text strings separated by commas'),
  numeric_set: () => __('Enter a list of numbers separated by commas'),
};

// ── Main export ───────────────────────────────────────────────────────────────

export const buildFieldConfig = (metadata, opts = {}) => {
  const config = [];

  // Find field names are excluded from the Field group — they belong in the
  // Find group with the FIND compound editor.
  const findFieldNames = new Set((metadata.finds || []).map(([, n]) => n));

  (metadata.fields || []).forEach(([label, name, colMeta]) => {
    if (findFieldNames.has(name)) {
      return;
    }

    const colType = (colMeta && colMeta.col_type) ? String(colMeta.col_type) : 'string';
    const subType = (colMeta && colMeta.sub_type) ? String(colMeta.sub_type) : null;
    const { units, unitLabel } = unitInfoForSubType(subType);
    const operators = (colMeta && colMeta.operators && colMeta.operators.length)
      ? colMeta.operators.map(op)
      : FALLBACK_OPERATORS.count;
    const placeholderFn = PLACEHOLDER_BY_COL_TYPE[colType];
    config.push({
      name,
      label,
      group: __('Field'),
      valueEditorType: valueEditorTypeForColType(colType),
      inputType: inputTypeForColType(colType),
      operators,
      colType,
      ...(subType ? { subType } : {}),
      ...(colType === 'boolean' ? { values: BOOLEAN_VALUES } : {}),
      ...(units ? { units } : {}),
      ...(unitLabel ? { unitLabel } : {}),
      ...(placeholderFn ? { placeholder: placeholderFn() } : {}),
    });
  });

  (metadata.counts || []).forEach(([label, assoc]) => {
    config.push({
      name: `__count__:${assoc}`,
      label,
      group: __('Count of'),
      valueEditorType: 'text',
      inputType: 'number',
      operators: FALLBACK_OPERATORS.count,
      colType: 'integer',
    });
  });

  (metadata.tags || []).forEach(([label, tagPath]) => {
    config.push({
      name: `__tag__:${tagPath}`,
      label,
      group: __('Tag'),
      valueEditorType: 'select', // tag values loaded dynamically via custom ValueEditor
      operators: FALLBACK_OPERATORS.tag,
      colType: 'tag',
    });
  });

  (metadata.finds || []).forEach(([label, findField]) => {
    config.push({
      name: `__find__:${findField}`,
      label,
      group: __('Find'),
      valueEditorType: 'text', // custom renderer overrides based on __find__: prefix
      operators: FALLBACK_OPERATORS.find,
      colType: 'find',
    });
  });

  if (opts.includeRegkey) {
    config.push({
      name: '__regkey__',
      label: __('Registry'),
      group: __('Registry'),
      valueEditorType: 'text', // custom ValueEditor renders key/value/data inputs
      operators: FALLBACK_OPERATORS.regkey,
      colType: 'regkey',
    });
  }

  return config;
};

export const findField = (fields, name) => fields.find((f) => f.name === name) || null;
