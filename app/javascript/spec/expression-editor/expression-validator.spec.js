import { validateExpression } from '../../components/expression-editor/expression-validator';

// Helpers to build minimal RQB rule/group objects.
const rule = (overrides) => ({
  id: 'r1',
  field: 'Vm-name',
  operator: '=',
  value: 'test',
  ...overrides,
});

const group = (rules, combinator = 'and') => ({
  id: 'g1',
  combinator,
  rules,
});

// Minimal field-config entries for date/datetime tests.
const DATE_FIELD = { name: 'Vm-retires_on', colType: 'date' };
const DATETIME_FIELD = { name: 'Vm-last_scan_on', colType: 'datetime' };
const STRING_FIELD = { name: 'Vm-name', colType: 'string' };

describe('validateExpression', () => {
  // ── Empty / null inputs ──────────────────────────────────────────────────────

  it('returns [] for null', () => {
    expect(validateExpression(null)).toEqual([]);
  });

  it('returns [] for an empty group', () => {
    expect(validateExpression(group([]))).toEqual([]);
  });

  // ── Standard field rules ─────────────────────────────────────────────────────

  it('returns [] for a complete field rule', () => {
    expect(validateExpression(group([rule()]))).toEqual([]);
  });

  it('returns an error when field is empty', () => {
    const errors = validateExpression(group([rule({ field: '' })]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/field must be selected/i);
  });

  it('returns an error when value is empty string', () => {
    const errors = validateExpression(group([rule({ value: '' })]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/value must be entered/i);
  });

  it('returns an error when value is null', () => {
    const errors = validateExpression(group([rule({ value: null })]));
    expect(errors).toHaveLength(1);
  });

  it('returns [] for no-value operators (IS NULL)', () => {
    expect(validateExpression(group([rule({ operator: 'IS NULL', value: null })]))).toEqual([]);
  });

  it('returns [] for no-value operators (IS NOT NULL)', () => {
    expect(validateExpression(group([rule({ operator: 'IS NOT NULL', value: '' })]))).toEqual([]);
  });

  it('returns [] when value is the user-input sentinel', () => {
    expect(validateExpression(group([rule({ value: '__user_input__' })]))).toEqual([]);
  });

  // ── Tag rules ────────────────────────────────────────────────────────────────

  it('returns [] for a complete tag rule', () => {
    const r = rule({ field: '__tag__:managed/location', operator: 'CONTAINS', value: 'London' });
    expect(validateExpression(group([r]))).toEqual([]);
  });

  it('returns an error when tag value is empty', () => {
    const r = rule({ field: '__tag__:managed/location', operator: 'CONTAINS', value: '' });
    const errors = validateExpression(group([r]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/tag value must be chosen/i);
  });

  it('returns an error when tag value is null', () => {
    const r = rule({ field: '__tag__:managed/location', operator: 'CONTAINS', value: null });
    expect(validateExpression(group([r]))).toHaveLength(1);
  });

  // ── Find rules ───────────────────────────────────────────────────────────────

  it('returns [] for a complete checkall find rule', () => {
    const r = rule({
      field: '__find__:Vm-hardware-disks-filename',
      operator: 'FIND',
      value: {
        skey: '=', svalue: 'foo', check: 'checkall', cfield: 'Vm-hardware-disks-size', ckey: '>', cvalue: '100',
      },
    });
    expect(validateExpression(group([r]))).toEqual([]);
  });

  it('returns an error when checkall find rule has no cfield', () => {
    const r = rule({
      field: '__find__:Vm-hardware-disks-filename',
      operator: 'FIND',
      value: {
        skey: '=', svalue: 'foo', check: 'checkall', cfield: '', ckey: '>', cvalue: '100',
      },
    });
    const errors = validateExpression(group([r]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/check field must be chosen/i);
  });

  it('returns an error when checkcount find rule has non-integer cvalue', () => {
    const r = rule({
      field: '__find__:Vm-hardware-disks-filename',
      operator: 'FIND',
      value: {
        skey: '=', svalue: 'foo', check: 'checkcount', cfield: '', ckey: '>', cvalue: 'abc',
      },
    });
    const errors = validateExpression(group([r]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/integer/i);
  });

  it('returns [] for a valid checkcount find rule', () => {
    const r = rule({
      field: '__find__:Vm-hardware-disks-filename',
      operator: 'FIND',
      value: {
        skey: '=', svalue: 'foo', check: 'checkcount', cfield: '', ckey: '>', cvalue: '3',
      },
    });
    expect(validateExpression(group([r]))).toEqual([]);
  });

  // ── Registry key rules ───────────────────────────────────────────────────────

  it('returns [] for a complete regkey rule', () => {
    const r = rule({ field: '__regkey__', operator: '=', value: { regkey: 'HKLM\\Software', regval: 'Version', data: '1.0' } });
    expect(validateExpression(group([r]))).toEqual([]);
  });

  it('returns an error when regkey is empty', () => {
    const r = rule({ field: '__regkey__', operator: '=', value: { regkey: '', regval: 'Version', data: '1.0' } });
    const errors = validateExpression(group([r]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/registry key name must be entered/i);
  });

  it('returns an error when regval is empty and operator is not KEY EXISTS', () => {
    const r = rule({ field: '__regkey__', operator: '=', value: { regkey: 'HKLM\\Software', regval: '', data: '1.0' } });
    const errors = validateExpression(group([r]));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/registry value name must be entered/i);
  });

  it('returns [] when regval is empty but operator is KEY EXISTS', () => {
    const r = rule({ field: '__regkey__', operator: 'KEY EXISTS', value: { regkey: 'HKLM\\Software', regval: '' } });
    expect(validateExpression(group([r]))).toEqual([]);
  });

  // ── Nested groups ────────────────────────────────────────────────────────────

  it('validates rules inside nested groups', () => {
    const inner = group([rule({ value: '' })], 'or');
    const outer = group([rule(), inner]);
    const errors = validateExpression(outer);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/value must be entered/i);
  });

  it('accumulates errors from multiple invalid rules', () => {
    const errors = validateExpression(group([
      rule({ value: '' }),
      rule({ field: '__tag__:managed/location', operator: 'CONTAINS', value: null }),
    ]));
    expect(errors).toHaveLength(2);
  });

  // ── Date / datetime field rules ──────────────────────────────────────────────

  describe('date fields (with field config)', () => {
    const fields = [DATE_FIELD, DATETIME_FIELD, STRING_FIELD];

    it('returns [] for a valid specific date value', () => {
      const r = rule({ field: 'Vm-retires_on', operator: '=', value: '2024-01-15' });
      expect(validateExpression(group([r]), fields)).toEqual([]);
    });

    it('returns [] for a valid datetime value with time', () => {
      const r = rule({ field: 'Vm-last_scan_on', operator: '=', value: '2024-01-15 14:30' });
      expect(validateExpression(group([r]), fields)).toEqual([]);
    });

    it('returns an error for a blank date value', () => {
      const r = rule({ field: 'Vm-retires_on', operator: '=', value: '' });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/date value must be entered/i);
    });

    it('returns an error for a null date value', () => {
      const r = rule({ field: 'Vm-retires_on', operator: '=', value: null });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/date value must be entered/i);
    });

    it('returns an error when only a time is present (no date part)', () => {
      // Bug that prompted this: time Select auto-defaults but date picker is untouched,
      // leaving value=" 14:30" or "14:30" with no ISO date.
      const r = rule({ field: 'Vm-last_scan_on', operator: '=', value: ' 14:30' });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/valid date must be selected/i);
    });

    it('returns an error when value is a time-only string without leading space', () => {
      const r = rule({ field: 'Vm-last_scan_on', operator: '=', value: '14:30' });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/valid date must be selected/i);
    });

    it('returns [] for a relative date value (e.g. "Today")', () => {
      const r = rule({ field: 'Vm-retires_on', operator: '=', value: 'Today' });
      expect(validateExpression(group([r]), fields)).toEqual([]);
    });

    it('returns [] for a relative datetime value (e.g. "Last Hour")', () => {
      const r = rule({ field: 'Vm-last_scan_on', operator: '=', value: 'Last Hour' });
      expect(validateExpression(group([r]), fields)).toEqual([]);
    });

    it('returns [] for a FROM rule with two valid specific dates', () => {
      const r = rule({ field: 'Vm-retires_on', operator: 'FROM', value: ['2024-01-01', '2024-12-31'] });
      expect(validateExpression(group([r]), fields)).toEqual([]);
    });

    it('returns an error for a FROM rule where the through date is blank', () => {
      const r = rule({ field: 'Vm-retires_on', operator: 'FROM', value: ['2024-01-01', ''] });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/date value must be entered/i);
    });

    it('returns an error for a FROM rule where the from date is blank', () => {
      const r = rule({ field: 'Vm-retires_on', operator: 'FROM', value: ['', '2024-12-31'] });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/date value must be entered/i);
    });

    it('returns [] for IS NULL on a date field (no value required)', () => {
      const r = rule({ field: 'Vm-retires_on', operator: 'IS NULL', value: null });
      expect(validateExpression(group([r]), fields)).toEqual([]);
    });

    it('falls back to blank-check for a string field even when fields provided', () => {
      const r = rule({ field: 'Vm-name', operator: '=', value: '' });
      const errors = validateExpression(group([r]), fields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/value must be entered/i);
    });

    it('accepts grouped field config shape (from ExpressionEditor state)', () => {
      const groupedFields = [{ label: 'Field', options: [DATE_FIELD, STRING_FIELD] }];
      const r = rule({ field: 'Vm-retires_on', operator: '=', value: '' });
      const errors = validateExpression(group([r]), groupedFields);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(/date value must be entered/i);
    });

    it('returns [] without field config (no colType available — graceful degradation)', () => {
      // Without field config, date rules are treated as generic text — only blank is checked.
      // A time-only string is non-blank so it passes. This is the pre-fix behaviour for
      // callers that do not supply fields.
      const r = rule({ field: 'Vm-last_scan_on', operator: '=', value: ' 14:30' });
      expect(validateExpression(group([r]))).toEqual([]);
    });
  });
});
