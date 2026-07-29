import { buildFieldConfig, findField } from '../../components/expression-editor/field-config';

const sampleMetadata = {
  fields: [
    ['VM / Name', 'Vm-name', { col_type: 'string' }],
    ['VM / Number of CPUs', 'Vm-numCPUs', { col_type: 'integer' }],
    ['VM / Last Boot Time', 'Vm-last_boot_time', { col_type: 'datetime' }],
    ['VM / Retired', 'Vm-retired', { col_type: 'boolean' }],
    ['VM / Memory', 'Vm-mem_cpu', { col_type: 'integer', sub_type: 'bytes' }],
  ],
  counts: [
    ['Count of Disks', 'Vm-hardware-disks'],
    ['Count of NICs', 'Vm-hardware-nics'],
  ],
  tags: [
    ['Location', 'managed/location'],
    ['Environment', 'managed/environment'],
  ],
  finds: [
    ['VM / Disks / Filename', 'Vm-hardware-disks-filename'],
  ],
};

describe('buildFieldConfig', () => {
  let config;

  beforeEach(() => {
    config = buildFieldConfig(sampleMetadata, { includeRegkey: true });
  });

  it('includes all standard fields', () => {
    const names = config.map((f) => f.name);
    expect(names).toContain('Vm-name');
    expect(names).toContain('Vm-numCPUs');
    expect(names).toContain('Vm-last_boot_time');
    expect(names).toContain('Vm-retired');
  });

  it('sets valueEditorType:text for string fields', () => {
    const f = config.find((c) => c.name === 'Vm-name');
    expect(f.valueEditorType).toBe('text');
    expect(f.inputType).toBe('text');
  });

  it('sets inputType:number for integer fields', () => {
    const f = config.find((c) => c.name === 'Vm-numCPUs');
    expect(f.inputType).toBe('number');
  });

  it('sets valueEditorType:date for datetime fields', () => {
    const f = config.find((c) => c.name === 'Vm-last_boot_time');
    expect(f.valueEditorType).toBe('date');
  });

  it('sets valueEditorType:select for boolean fields', () => {
    const f = config.find((c) => c.name === 'Vm-retired');
    expect(f.valueEditorType).toBe('select');
  });

  it('sets values:[true,false] entries for boolean fields', () => {
    const f = config.find((c) => c.name === 'Vm-retired');
    expect(Array.isArray(f.values)).toBe(true);
    expect(f.values).toHaveLength(2);
    const names = f.values.map((v) => v.name);
    expect(names).toContain('true');
    expect(names).toContain('false');
  });

  it('does not set values for non-boolean string fields', () => {
    const f = config.find((c) => c.name === 'Vm-name');
    expect(f.values).toBeUndefined();
  });

  it('sets units for bytes sub_type fields', () => {
    const f = config.find((c) => c.name === 'Vm-mem_cpu');
    expect(Array.isArray(f.units)).toBe(true);
    expect(f.units.length).toBeGreaterThan(0);
  });

  it('adds count entries with __count__ prefix', () => {
    const names = config.map((f) => f.name);
    expect(names).toContain('__count__:Vm-hardware-disks');
    expect(names).toContain('__count__:Vm-hardware-nics');
  });

  it('count entries use count operators', () => {
    const f = config.find((c) => c.name === '__count__:Vm-hardware-disks');
    const names = f.operators.map((o) => o.name);
    expect(names).toEqual(['=', '!=', '<', '<=', '>=', '>']);
  });

  it('adds tag entries with __tag__ prefix', () => {
    const names = config.map((f) => f.name);
    expect(names).toContain('__tag__:managed/location');
    expect(names).toContain('__tag__:managed/environment');
  });

  it('tag entries have only CONTAINS operator', () => {
    const f = config.find((c) => c.name === '__tag__:managed/location');
    expect(f.operators).toHaveLength(1);
    expect(f.operators[0].name).toBe('CONTAINS');
  });

  it('adds find entries with __find__ prefix', () => {
    const names = config.map((f) => f.name);
    expect(names).toContain('__find__:Vm-hardware-disks-filename');
  });

  it('adds __regkey__ when includeRegkey:true', () => {
    const names = config.map((f) => f.name);
    expect(names).toContain('__regkey__');
  });

  it('does not add __regkey__ when includeRegkey is not set', () => {
    const cfg = buildFieldConfig(sampleMetadata);
    const names = cfg.map((f) => f.name);
    expect(names).not.toContain('__regkey__');
  });

  it('assigns a group label to each entry type', () => {
    const fieldEntry = config.find((c) => c.name === 'Vm-name');
    const countEntry = config.find((c) => c.name === '__count__:Vm-hardware-disks');
    const tagEntry   = config.find((c) => c.name === '__tag__:managed/location');
    const findEntry  = config.find((c) => c.name === '__find__:Vm-hardware-disks-filename');
    const regEntry   = config.find((c) => c.name === '__regkey__');
    // All should have a non-empty group
    [fieldEntry, countEntry, tagEntry, findEntry, regEntry].forEach((e) => {
      expect(typeof e.group).toBe('string');
      expect(e.group.length).toBeGreaterThan(0);
    });
  });

  it('handles empty metadata gracefully', () => {
    const cfg = buildFieldConfig({});
    expect(cfg).toEqual([]);
  });
});

describe('findField', () => {
  let config;
  beforeEach(() => {
    config = buildFieldConfig(sampleMetadata);
  });

  it('returns the matching field entry', () => {
    const f = findField(config, 'Vm-name');
    expect(f).not.toBeNull();
    expect(f.name).toBe('Vm-name');
  });

  it('returns null for unknown field', () => {
    expect(findField(config, 'Unknown-field')).toBeNull();
  });
});
