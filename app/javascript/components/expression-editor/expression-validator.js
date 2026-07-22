// Client-side validation for an RQB query, mirroring the server-side
// exp_commit_* checks in ApplicationController::Filter.

const NO_VALUE_OPS = new Set([
  'IS NULL', 'IS NOT NULL', 'IS EMPTY', 'IS NOT EMPTY',
  'KEY EXISTS', 'VALUE EXISTS',
]);

const USER_INPUT_SENTINEL = '__user_input__';

const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';

const isInteger = (v) => !isBlank(v) && /^-?\d+$/.test(String(v).trim());

// ISO date part "yyyy-mm-dd" — the format stored by DateValueEditor.
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Relative-date sentinel strings come from FROM_* option lists:
//   Letter-led: "Today", "Yesterday", "Last Month", "This Hour", …
//   Digit-led:  "2 Days Ago", "3 Hours Ago", "14 Days Ago", …
// A digit-led relative string always has a space between the number and the word,
// e.g. "2 Days Ago" — unlike a time string "14:30" which never has a space.
const isRelativeDate = (v) => {
  if (typeof v !== 'string') return false;
  const t = v.trim();
  if (/^[A-Z]/.test(t)) return true;          // letter-led: "Today", "Last Month", …
  if (/^\d+\s+\S/.test(t)) return true;       // digit-led with space: "2 Days Ago", …
  return false;
};

// Validate a specific-mode date/datetime string of the form "yyyy-mm-dd" or
// "yyyy-mm-dd HH:MM".  Returns an error string or null.
const validateSpecificDate = (val, isDatetime) => {
  if (isBlank(val)) {
    return __('A date value must be entered');
  }
  const str = String(val);
  const spaceIdx = str.indexOf(' ');
  const datePart = spaceIdx === -1 ? str : str.slice(0, spaceIdx);
  const timePart = spaceIdx === -1 ? null : str.slice(spaceIdx + 1);

  if (!ISO_DATE_RE.test(datePart)) {
    return __('A valid date must be selected');
  }
  if (isDatetime && timePart !== null && timePart.trim() === '') {
    return __('A valid time must be selected');
  }
  return null;
};

// Validate a single date/datetime value (scalar or one element of a FROM pair).
const validateOneDateValue = (val, isDatetime) => {
  if (isBlank(val)) {
    return __('A date value must be entered');
  }
  if (isRelativeDate(val)) {
    return null; // relative option — always valid
  }
  return validateSpecificDate(val, isDatetime);
};

// Validate the value for a date or datetime field.
const validateDateRule = (value, operator, isDatetime) => {
  if (operator === 'FROM') {
    const from = Array.isArray(value) ? value[0] : value;
    const through = Array.isArray(value) ? value[1] : null;
    const errFrom = validateOneDateValue(from, isDatetime);
    if (errFrom) return errFrom;
    const errThrough = validateOneDateValue(through, isDatetime);
    if (errThrough) return errThrough;
    return null;
  }
  return validateOneDateValue(Array.isArray(value) ? value[0] : value, isDatetime);
};

const validateRule = (rule, fieldCfg) => {
  const { field, operator, value } = rule;
  const errors = [];

  if (!field) {
    errors.push(__('A field must be selected for every expression element'));
    return errors;
  }

  if (field.startsWith('__tag__:')) {
    if (isBlank(value)) {
      errors.push(__('A tag value must be chosen'));
    }
    return errors;
  }

  if (field.startsWith('__find__:')) {
    const v = (value && typeof value === 'object') ? value : {};
    if (['checkall', 'checkany'].includes(v.check) && isBlank(v.cfield)) {
      errors.push(__('A check field must be chosen for the Find expression element'));
    }
    if (v.check === 'checkcount' && !isInteger(v.cvalue)) {
      errors.push(__('The check count value must be an integer'));
    }
    return errors;
  }

  if (field === '__regkey__') {
    const v = (value && typeof value === 'object') ? value : {};
    if (isBlank(v.regkey)) {
      errors.push(__('A registry key name must be entered'));
    } else if (operator !== 'KEY EXISTS' && isBlank(v.regval)) {
      errors.push(__('A registry value name must be entered'));
    }
    return errors;
  }

  if (NO_VALUE_OPS.has(operator) || value === USER_INPUT_SENTINEL) {
    return errors;
  }

  // Date / datetime fields: validate the date string structure.
  const colType = fieldCfg && fieldCfg.colType;
  if (colType === 'date' || colType === 'datetime') {
    const dateErr = validateDateRule(value, operator, colType === 'datetime');
    if (dateErr) {
      errors.push(dateErr);
    }
    return errors;
  }

  if (isBlank(value)) {
    errors.push(__('A value must be entered for every expression element'));
  }

  return errors;
};

const walkGroup = (group, flatFields) => {
  const errors = [];
  (group.rules || []).forEach((r) => {
    if (r.rules !== undefined) {
      errors.push(...walkGroup(r, flatFields));
    } else {
      const cfg = flatFields && flatFields.find((f) => f.name === r.field);
      errors.push(...validateRule(r, cfg || null));
    }
  });
  return errors;
};

/**
 * Validate an RQB query object.
 *
 * @param {Object}  query      - RQB query (root group with .rules[]).
 * @param {Array}   [fields]   - Flat field-config array from buildFieldConfig / the
 *                               grouped options from ExpressionEditor state.  When
 *                               supplied, date/datetime fields receive structural
 *                               date-value validation in addition to the generic
 *                               blank-value check.
 */
export const validateExpression = (query, fields) => {
  if (!query || !Array.isArray(query.rules) || query.rules.length === 0) {
    return [];
  }
  // Accept either the grouped [{label, options:[]}] shape from ExpressionEditor
  // or a plain flat array from buildFieldConfig.
  const flatFields = fields
    ? fields.flatMap((g) => (Array.isArray(g.options) ? g.options : [g]))
    : null;
  return walkGroup(query, flatFields);
};
