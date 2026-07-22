import { miqToRqb, rqbToMiq } from '../../components/expression-editor/expression-adapter';

// ── miqToRqb ─────────────────────────────────────────────────────────────────

describe('miqToRqb', () => {
  it('converts a single field atom to a root AND group with one rule', () => {
    const miq = { '=': { field: 'Vm-name', value: 'test' } };
    const result = miqToRqb(miq);
    expect(result.combinator).toBe('and');
    expect(result.rules).toHaveLength(1);
    expect(result.rules[0].field).toBe('Vm-name');
    expect(result.rules[0].operator).toBe('=');
    expect(result.rules[0].value).toBe('test');
  });

  it('converts an AND expression to combinator:and with two rules', () => {
    const miq = {
      and: [
        { '=': { field: 'Vm-name', value: 'a' } },
        { '!=': { field: 'Vm-name', value: 'b' } },
      ],
    };
    const result = miqToRqb(miq);
    expect(result.combinator).toBe('and');
    expect(result.rules).toHaveLength(2);
    expect(result.rules[0].operator).toBe('=');
    expect(result.rules[1].operator).toBe('!=');
  });

  it('converts an OR expression to combinator:or', () => {
    const miq = {
      or: [
        { '=': { field: 'Vm-name', value: 'a' } },
        { '=': { field: 'Vm-name', value: 'b' } },
      ],
    };
    const result = miqToRqb(miq);
    expect(result.combinator).toBe('or');
  });

  it('converts a NOT wrapper to not:true on the inner group', () => {
    const miq = {
      not: { '=': { field: 'Vm-name', value: 'x' } },
    };
    const result = miqToRqb(miq);
    expect(result.not).toBe(true);
    expect(result.rules[0].field).toBe('Vm-name');
  });

  it('converts nested AND inside OR', () => {
    const miq = {
      or: [
        { '=': { field: 'Vm-name', value: 'a' } },
        {
          and: [
            { '=': { field: 'Vm-name', value: 'b' } },
            { '=': { field: 'Vm-name', value: 'c' } },
          ],
        },
      ],
    };
    const result = miqToRqb(miq);
    expect(result.combinator).toBe('or');
    expect(result.rules[1].combinator).toBe('and');
    expect(result.rules[1].rules).toHaveLength(2);
  });

  it('converts a count atom with __count__ prefix', () => {
    const miq = { '>=': { count: 'Vm-hardware-disks', value: '3' } };
    const result = miqToRqb(miq);
    expect(result.rules[0].field).toBe('__count__:Vm-hardware-disks');
    expect(result.rules[0].operator).toBe('>=');
    expect(result.rules[0].value).toBe('3');
  });

  it('converts a tag atom with __tag__ prefix', () => {
    const miq = { CONTAINS: { tag: 'managed/location', value: 'US-East' } };
    const result = miqToRqb(miq);
    expect(result.rules[0].field).toBe('__tag__:managed/location');
    expect(result.rules[0].operator).toBe('CONTAINS');
    expect(result.rules[0].value).toBe('US-East');
  });

  it('converts a regkey atom to field __regkey__', () => {
    const miq = { '=': { regkey: 'HKLM/Software', regval: 'Version', value: '10' } };
    const result = miqToRqb(miq);
    const rule = result.rules[0];
    expect(rule.field).toBe('__regkey__');
    expect(rule.operator).toBe('=');
    expect(rule.value.regkey).toBe('HKLM/Software');
    expect(rule.value.regval).toBe('Version');
    expect(rule.value.data).toBe('10');
  });

  it('converts a FIND atom with __find__ prefix', () => {
    const miq = {
      FIND: {
        search: { '=': { field: 'Vm-hardware-disks-filename', value: 'boot' } },
        checkall: { '=': { field: 'Vm-hardware-disks-size', value: '100' } },
      },
    };
    const result = miqToRqb(miq);
    const rule = result.rules[0];
    expect(rule.field).toBe('__find__:Vm-hardware-disks-filename');
    expect(rule.operator).toBe('FIND');
    expect(rule.value.skey).toBe('=');
    expect(rule.value.svalue).toBe('boot');
    expect(rule.value.check).toBe('checkall');
    expect(rule.value.cfield).toBe('Vm-hardware-disks-size');
  });

  it('returns an empty AND group for null/empty input', () => {
    expect(miqToRqb(null).rules).toHaveLength(0);
    expect(miqToRqb({}).rules).toHaveLength(0);
  });

  it('assigns a unique id to every node', () => {
    const miq = {
      and: [
        { '=': { field: 'Vm-name', value: 'a' } },
        { '=': { field: 'Vm-name', value: 'b' } },
      ],
    };
    const result = miqToRqb(miq);
    const ids = [result.id, result.rules[0].id, result.rules[1].id];
    expect(new Set(ids).size).toBe(3);
  });
});

// ── rqbToMiq ─────────────────────────────────────────────────────────────────

describe('rqbToMiq', () => {
  it('converts a single-rule AND group to a bare atom', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2', field: 'Vm-name', operator: '=', value: 'test',
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result['=']).toBeDefined();
    expect(result['='].field).toBe('Vm-name');
    expect(result['='].value).toBe('test');
  });

  it('converts a multi-rule AND group to { and: [...] }', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [
        {
          id: '2', field: 'Vm-name', operator: '=', value: 'a',
        },
        {
          id: '3', field: 'Vm-name', operator: '!=', value: 'b',
        },
      ],
    };
    const result = rqbToMiq(rqb);
    expect(Array.isArray(result.and)).toBe(true);
    expect(result.and).toHaveLength(2);
  });

  it('converts a multi-rule OR group to { or: [...] }', () => {
    const rqb = {
      id: '1',
      combinator: 'or',
      not: false,
      rules: [
        {
          id: '2', field: 'Vm-name', operator: '=', value: 'a',
        },
        {
          id: '3', field: 'Vm-name', operator: '=', value: 'b',
        },
      ],
    };
    const result = rqbToMiq(rqb);
    expect(Array.isArray(result.or)).toBe(true);
  });

  it('wraps not:true groups in { not: ... }', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: true,
      rules: [{
        id: '2', field: 'Vm-name', operator: '=', value: 'x',
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result.not).toBeDefined();
    expect(result.not['=']).toBeDefined();
  });

  it('converts a __count__ rule back to a count atom', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2', field: '__count__:Vm-hardware-disks', operator: '>=', value: '3',
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result['>='].count).toBe('Vm-hardware-disks');
    expect(result['>='].value).toBe('3');
  });

  it('converts a __tag__ rule back to a tag atom', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2', field: '__tag__:managed/location', operator: 'CONTAINS', value: 'US-East',
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result.CONTAINS.tag).toBe('managed/location');
    expect(result.CONTAINS.value).toBe('US-East');
  });

  it('converts a __regkey__ rule back to a regkey atom', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2',
        field: '__regkey__',
        operator: '=',
        value: { regkey: 'HKLM/Software', regval: 'Version', data: '10' },
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result['='].regkey).toBe('HKLM/Software');
    expect(result['='].regval).toBe('Version');
    expect(result['='].value).toBe('10');
  });

  it('converts a __find__ rule back to a FIND atom', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2',
        field: '__find__:Vm-hardware-disks-filename',
        operator: 'FIND',
        value: {
          skey: '=',
          svalue: 'boot',
          check: 'checkall',
          cfield: 'Vm-hardware-disks-size',
          ckey: '=',
          cvalue: '100',
        },
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result.FIND).toBeDefined();
    expect(result.FIND.search['='].field).toBe('Vm-hardware-disks-filename');
    expect(result.FIND.checkall['='].field).toBe('Vm-hardware-disks-size');
  });

  it('returns null for an empty rules array', () => {
    const rqb = {
      id: '1', combinator: 'and', not: false, rules: [],
    };
    const result = rqbToMiq(rqb);
    expect(result).toBeNull();
  });

  it('keeps a single-rule nested subgroup as a { combinator: [...] } wrapper, not a bare atom', () => {
    // Root group with two rules — one is itself a sub-group with only one rule.
    // Without the fix this sub-group would be flattened to a bare atom and then
    // round-tripped back into the root group instead of staying nested.
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [
        {
          id: '2', field: 'Vm-name', operator: '=', value: 'a',
        },
        {
          id: '3',
          combinator: 'or',
          not: false,
          rules: [{
            id: '4', field: 'Vm-name', operator: '!=', value: 'b',
          }],
        },
      ],
    };
    const result = rqbToMiq(rqb);
    // Top level must be { and: [...] }
    expect(Array.isArray(result.and)).toBe(true);
    expect(result.and).toHaveLength(2);
    // Second child must be a { or: [...] } group, NOT a bare atom
    expect(Array.isArray(result.and[1].or)).toBe(true);
    expect(result.and[1].or).toHaveLength(1);
  });
});

// ── Round-trip ────────────────────────────────────────────────────────────────

describe('round-trip miqToRqb → rqbToMiq', () => {
  const cases = [
    ['single field atom', { '=': { field: 'Vm-name', value: 'test' } }],
    ['nested group with a single rule inside an AND', {
      and: [
        { '=': { field: 'Vm-name', value: 'a' } },
        { or: [{ '!=': { field: 'Vm-name', value: 'b' } }] },
      ],
    }],
    ['AND of two atoms', {
      and: [
        { '=': { field: 'Vm-name', value: 'a' } },
        { '!=': { field: 'Vm-name', value: 'b' } },
      ],
    }],
    ['OR of two atoms', {
      or: [
        { '=': { field: 'Vm-name', value: 'a' } },
        { '=': { field: 'Vm-name', value: 'b' } },
      ],
    }],
    ['NOT of a field atom', { not: { '=': { field: 'Vm-name', value: 'x' } } }],
    ['count atom', { '>=': { count: 'Vm-hardware-disks', value: '3' } }],
    ['tag atom', { CONTAINS: { tag: 'managed/location', value: 'US-East' } }],
    ['regkey atom', { '=': { regkey: 'HKLM/Software', regval: 'Ver', value: '10' } }],
  ];

  cases.forEach(([name, miqExp]) => {
    it(`preserves ${name}`, () => {
      const roundTripped = rqbToMiq(miqToRqb(miqExp));
      expect(roundTripped).toEqual(miqExp);
    });
  });
});

// ── Date format detection (Phase 2) ──────────────────────────────────────────

describe('miqToRqb — date format detection', () => {
  it('sets dateFormat:"s" for a specific date value containing "/"', () => {
    const miq = { IS: { field: 'Vm-retires_on', value: '12/25/2024' } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.dateFormat).toBe('s');
  });

  it('sets dateFormat:"r" for a relative date value without "/"', () => {
    const miq = { IS: { field: 'Vm-retires_on', value: 'Today' } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.dateFormat).toBe('r');
  });

  it('sets dateFormat:"r" for a relative date value with spaces (e.g. "Last Week")', () => {
    const miq = { BEFORE: { field: 'Vm-retires_on', value: 'Last Week' } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.dateFormat).toBe('r');
  });

  it('does not set dateFormat when value is null', () => {
    const miq = { IS: { field: 'Vm-retires_on', value: null } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.dateFormat).toBeUndefined();
  });

  it('sets dateFormat:"s" for a FROM atom with specific array values', () => {
    const miq = { FROM: { field: 'Vm-retires_on', value: ['12/01/2024', '12/31/2024'] } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.dateFormat).toBe('s');
    // value is preserved as array
    expect(Array.isArray(rule.value)).toBe(true);
    expect(rule.value[0]).toBe('12/01/2024');
    expect(rule.value[1]).toBe('12/31/2024');
  });

  it('sets dateFormat:"r" for a FROM atom with relative array values', () => {
    const miq = { FROM: { field: 'Vm-retires_on', value: ['Today', 'Last Week'] } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.dateFormat).toBe('r');
    expect(Array.isArray(rule.value)).toBe(true);
    expect(rule.value[0]).toBe('Today');
  });
});

describe('rqbToMiq — date round-trip', () => {
  it('preserves a scalar specific date value', () => {
    const miq = { IS: { field: 'Vm-retires_on', value: '12/25/2024' } };
    expect(rqbToMiq(miqToRqb(miq))).toEqual(miq);
  });

  it('preserves a scalar relative date value', () => {
    const miq = { BEFORE: { field: 'Vm-retires_on', value: 'Today' } };
    expect(rqbToMiq(miqToRqb(miq))).toEqual(miq);
  });

  it('preserves a FROM atom with array values', () => {
    const miq = { FROM: { field: 'Vm-retires_on', value: ['Today', 'Last Week'] } };
    expect(rqbToMiq(miqToRqb(miq))).toEqual(miq);
  });

  it('does NOT write dateFormat to the MiqExpression output', () => {
    const miq = { IS: { field: 'Vm-retires_on', value: '12/25/2024' } };
    const output = rqbToMiq(miqToRqb(miq));
    // The output atom must not contain a dateFormat key at any level
    expect(JSON.stringify(output)).not.toContain('dateFormat');
  });
});

// ── User-input sentinel (Phase 4-C) ──────────────────────────────────────────

describe('miqToRqb — user-input sentinel', () => {
  it('decodes :user_input value to __user_input__ in the RQB rule', () => {
    const miq = { '=': { field: 'Vm-name', value: ':user_input' } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.value).toBe('__user_input__');
  });

  it('leaves normal string values untouched', () => {
    const miq = { '=': { field: 'Vm-name', value: 'foo' } };
    const rule = miqToRqb(miq).rules[0];
    expect(rule.value).toBe('foo');
  });
});

describe('rqbToMiq — user-input sentinel', () => {
  it('encodes __user_input__ back to :user_input', () => {
    const rqb = {
      id: '1',
      combinator: 'and',
      not: false,
      rules: [{
        id: '2', field: 'Vm-name', operator: '=', value: '__user_input__',
      }],
    };
    const result = rqbToMiq(rqb);
    expect(result['='].value).toBe(':user_input');
  });

  it('round-trips :user_input through miqToRqb → rqbToMiq', () => {
    const miq = { '=': { field: 'Vm-name', value: ':user_input' } };
    expect(rqbToMiq(miqToRqb(miq))).toEqual(miq);
  });
});

