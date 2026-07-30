import {
  miqExpressionToHuman,
  quoteHuman,
  normalizeOperator,
  labelFor,
} from '../../components/expression-editor/expression-human';

const LABEL_MAP = new Map([
  ['Vm-name', 'VM and Instance : Name'],
  ['Vm-num_cpu', 'VM and Instance : Number of CPUs'],
  ['Vm-retires_on', 'VM and Instance : Retires On'],
  ['Vm-last_scan_on', 'VM and Instance : Last Analysis Time'],
  ['Vm-hardware-disks-filename', 'VM and Instance.Disks : Filename'],
  ['__tag__:managed/location', 'Location'],
  ['__tag__:managed/environment', 'Environment'],
  ['__tag__:Vm.managed-prov_max_cpu', 'VM and Instance : Max CPUs (Provisioning)'],
  ['__count__:Vm-hardware-disks', 'VM and Instance.Disks'],
  ['__find__:Vm-hardware-disks-filename', 'VM and Instance.Disks : Filename'],
]);

const TAG_CACHE = new Map([
  ['managed/location', [
    { label: 'New York', name: 'ny' },
    { label: 'London', name: 'london' },
  ]],
]);

describe('quoteHuman', () => {
  it('wraps a string value in double-quotes', () => {
    expect(quoteHuman('myvm', 'string')).toBe('"myvm"');
  });

  it('wraps a date value in double-quotes', () => {
    expect(quoteHuman('2024/01/01', 'date')).toBe('"2024/01/01"');
  });

  it('returns bare number for integer colType', () => {
    expect(quoteHuman('4', 'integer')).toBe('4');
  });

  it('returns bare number for float colType', () => {
    expect(quoteHuman('3.14', 'float')).toBe('3.14');
  });

  it('formats bytes suffix: 42.megabytes → "42 MB"', () => {
    expect(quoteHuman('42.megabytes', 'integer')).toBe('"42 MB"');
  });

  it('formats bytes suffix: 1.gigabytes → "1 GB"', () => {
    expect(quoteHuman('1.gigabytes', 'integer')).toBe('"1 GB"');
  });

  it('formats bytes suffix: 512.kilobytes → "512 KB"', () => {
    expect(quoteHuman('512.kilobytes', 'string')).toBe('"512 KB"');
  });

  it('formats bytes suffix: 100.terabytes → "100 TB"', () => {
    expect(quoteHuman('100.terabytes', 'string')).toBe('"100 TB"');
  });

  it('formats bytes suffix: 8.bytes → "8 Bytes"', () => {
    expect(quoteHuman('8.bytes', 'string')).toBe('"8 Bytes"');
  });

  it('wraps null in empty double-quotes', () => {
    expect(quoteHuman(null, 'string')).toBe('""');
  });

  it('wraps undefined in empty double-quotes', () => {
    expect(quoteHuman(undefined, 'string')).toBe('""');
  });

  it('wraps unknown suffix string in double-quotes unchanged', () => {
    expect(quoteHuman('hello.world', 'string')).toBe('"hello.world"');
  });
});

describe('normalizeOperator', () => {
  it('EQUAL → =', () => expect(normalizeOperator('EQUAL')).toBe('='));
  it('! → NOT', () => expect(normalizeOperator('!')).toBe('NOT'));
  it('EXIST → CONTAINS', () => expect(normalizeOperator('EXIST')).toBe('CONTAINS'));
  it('= stays =', () => expect(normalizeOperator('=')).toBe('='));
  it('!= stays !=', () => expect(normalizeOperator('!=')).toBe('!='));
  it('lowercases input uppercased: like → LIKE', () => expect(normalizeOperator('like')).toBe('LIKE'));
  it('null/undefined → empty string', () => {
    expect(normalizeOperator(null)).toBe('');
    expect(normalizeOperator(undefined)).toBe('');
  });
});

describe('labelFor', () => {
  it('looks up a plain field name (no prefix)', () => {
    expect(labelFor('Vm-name', LABEL_MAP)).toBe('VM and Instance : Name');
  });

  it('looks up a prefixed __tag__: key as-is', () => {
    expect(labelFor('__tag__:managed/location', LABEL_MAP)).toBe('Location');
  });

  it('looks up a prefixed __count__: key as-is', () => {
    expect(labelFor('__count__:Vm-hardware-disks', LABEL_MAP)).toBe('VM and Instance.Disks');
  });

  it('looks up a prefixed __find__: key as-is', () => {
    expect(labelFor('__find__:Vm-hardware-disks-filename', LABEL_MAP)).toBe('VM and Instance.Disks : Filename');
  });

  it('finds a tag label when caller passes bare tag path (adds __tag__: prefix)', () => {
    // This is the bug case: CONTAINS atom has tag:"managed/location" (no prefix)
    expect(labelFor('managed/location', LABEL_MAP)).toBe('Location');
  });

  it('finds a tag label for dot-dash style tag paths like Vm.managed-prov_max_cpu', () => {
    expect(labelFor('Vm.managed-prov_max_cpu', LABEL_MAP)).toBe('VM and Instance : Max CPUs (Provisioning)');
  });

  it('falls back to raw name when not in map', () => {
    expect(labelFor('Unknown-field', LABEL_MAP)).toBe('Unknown-field');
  });

  it('falls back to stripped name when prefixed key is not in map', () => {
    expect(labelFor('__tag__:no-such-tag', LABEL_MAP)).toBe('no-such-tag');
  });

  it('returns empty string for null/undefined name', () => {
    expect(labelFor(null, LABEL_MAP)).toBe('');
    expect(labelFor(undefined, LABEL_MAP)).toBe('');
  });

  it('returns name when labelMap is null', () => {
    expect(labelFor('Vm-name', null)).toBe('Vm-name');
  });
});

describe('miqExpressionToHuman', () => {
  it('= operator: VM and Instance : Name = "myvm"', () => {
    const miq = { '=': { field: 'Vm-name', value: 'myvm' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name = "myvm"');
  });

  it('!= operator', () => {
    const miq = { '!=': { field: 'Vm-name', value: 'bad' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name != "bad"');
  });

  it('< operator with number', () => {
    const miq = { '<': { field: 'Vm-num_cpu', value: '4' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Number of CPUs < "4"');
  });

  it('> operator', () => {
    const miq = { '>': { field: 'Vm-num_cpu', value: '2' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Number of CPUs > "2"');
  });

  it('>= operator', () => {
    const miq = { '>=': { field: 'Vm-num_cpu', value: '8' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Number of CPUs >= "8"');
  });

  it('<= operator', () => {
    const miq = { '<=': { field: 'Vm-num_cpu', value: '16' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Number of CPUs <= "16"');
  });

  it('LIKE operator', () => {
    const miq = { LIKE: { field: 'Vm-name', value: '%prod%' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name LIKE "%prod%"');
  });

  it('STARTS WITH operator', () => {
    const miq = { 'STARTS WITH': { field: 'Vm-name', value: 'web' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name STARTS WITH "web"');
  });

  it('ENDS WITH operator', () => {
    const miq = { 'ENDS WITH': { field: 'Vm-name', value: '.com' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name ENDS WITH ".com"');
  });

  it('INCLUDES operator', () => {
    const miq = { INCLUDES: { field: 'Vm-name', value: 'test' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name INCLUDES "test"');
  });

  it('REGULAR EXPRESSION MATCHES operator', () => {
    const miq = { 'REGULAR EXPRESSION MATCHES': { field: 'Vm-name', value: '^prod' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name REGULAR EXPRESSION MATCHES "^prod"');
  });

  it('REGULAR EXPRESSION DOES NOT MATCH operator', () => {
    const miq = { 'REGULAR EXPRESSION DOES NOT MATCH': { field: 'Vm-name', value: '^test' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name REGULAR EXPRESSION DOES NOT MATCH "^test"');
  });

  it('IS NULL operator (no value)', () => {
    const miq = { 'IS NULL': { field: 'Vm-name' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name IS NULL');
  });

  it('IS NOT NULL operator (no value)', () => {
    const miq = { 'IS NOT NULL': { field: 'Vm-name' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name IS NOT NULL');
  });

  it('IS EMPTY operator (no value)', () => {
    const miq = { 'IS EMPTY': { field: 'Vm-name' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name IS EMPTY');
  });

  it('IS NOT EMPTY operator (no value)', () => {
    const miq = { 'IS NOT EMPTY': { field: 'Vm-name' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Name IS NOT EMPTY');
  });

  it('IS operator (exact date)', () => {
    const miq = { IS: { field: 'Vm-retires_on', value: 'Today' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Retires On IS "Today"');
  });

  it('FROM operator renders THROUGH', () => {
    const miq = { FROM: { field: 'Vm-retires_on', value: ['2024/01/01', '2024/12/31'] } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Retires On FROM "2024/01/01" THROUGH "2024/12/31"');
  });

  it('BETWEEN DATES operator renders AND', () => {
    const miq = { 'BETWEEN DATES': { field: 'Vm-retires_on', value: ['2024/01/01', '2024/06/30'] } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Retires On BETWEEN DATES "2024/01/01" AND "2024/06/30"');
  });

  it('BETWEEN TIMES operator renders AND', () => {
    const miq = { 'BETWEEN TIMES': { field: 'Vm-last_scan_on', value: ['00:00:00', '12:00:00'] } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Last Analysis Time BETWEEN TIMES "00:00:00" AND "12:00:00"');
  });

  it('CONTAINS tag: resolves label from tagValuesCache', () => {
    const miq = { CONTAINS: { tag: 'managed/location', value: 'ny' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe("Location contains 'New York'");
  });

  it('CONTAINS tag: falls back to raw value when cache miss', () => {
    const miq = { CONTAINS: { tag: 'managed/environment', value: 'prod' } };
    // 'managed/environment' is not in TAG_CACHE
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe("Environment contains 'prod'");
  });

  it('CONTAINS tag: falls back when tag path not in cache', () => {
    const miq = { CONTAINS: { tag: 'managed/location', value: 'unknown_key' } };
    // 'unknown_key' is not in the cache entries for managed/location
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe("Location contains 'unknown_key'");
  });

  it('COUNT OF operator', () => {
    const miq = { '=': { count: 'Vm-hardware-disks', value: '3' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('COUNT OF VM and Instance.Disks = "3"');
  });

  it('KEY EXISTS registry op', () => {
    const miq = { 'KEY EXISTS': { regkey: 'HKLM\\Software\\MyApp', regval: '' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('KEY EXISTS HKLM\\Software\\MyApp');
  });

  it('VALUE EXISTS registry op', () => {
    const miq = { 'VALUE EXISTS': { regkey: 'HKLM\\Software\\MyApp', regval: 'Version' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VALUE EXISTS HKLM\\Software\\MyApp : Version');
  });

  it('Registry = op', () => {
    const miq = { '=': { regkey: 'HKLM\\Software\\MyApp', regval: 'Version', value: '2.0' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe("HKLM\\Software\\MyApp : Version = '2.0'");
  });

  it('FIND operator renders FIND ... CHECK ...', () => {
    const miq = {
      FIND: {
        search: { '=': { field: 'Vm-hardware-disks-filename', value: 'disk1.vmdk' } },
        checkall: { '=': { field: 'Vm-hardware-disks-filename', value: 'disk1.vmdk' } },
      },
    };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('FIND VM and Instance.Disks : Filename = "disk1.vmdk" CHECK VM and Instance.Disks : Filename = "disk1.vmdk"');
  });

  it('alias replaces the field label', () => {
    const miq = { '=': { field: 'Vm-name', value: 'web01', alias: 'Server Name' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('Server Name = "web01"');
  });

  it(':user_input sentinel renders as <Field Label>', () => {
    const miq = { '=': { field: 'Vm-name', value: ':user_input' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('<VM and Instance : Name>');
  });

  it('AND wraps parts in parentheses separated by AND', () => {
    const miq = {
      and: [
        { '=': { field: 'Vm-name', value: 'web01' } },
        { '=': { field: 'Vm-num_cpu', value: '4' } },
      ],
    };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('(VM and Instance : Name = "web01" AND VM and Instance : Number of CPUs = "4")');
  });

  it('OR wraps parts in parentheses separated by OR', () => {
    const miq = {
      or: [
        { '=': { field: 'Vm-name', value: 'web01' } },
        { '=': { field: 'Vm-name', value: 'web02' } },
      ],
    };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('(VM and Instance : Name = "web01" OR VM and Instance : Name = "web02")');
  });

  it('NOT wraps inner expression with NOT (...)', () => {
    const miq = { not: { '=': { field: 'Vm-name', value: 'bad' } } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('NOT (VM and Instance : Name = "bad")');
  });

  it('nested AND inside OR', () => {
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
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('(VM and Instance : Name = "a" OR (VM and Instance : Name = "b" AND VM and Instance : Name = "c"))');
  });

  it('returns empty string for null input', () => {
    expect(miqExpressionToHuman(null, LABEL_MAP, TAG_CACHE)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(miqExpressionToHuman(undefined, LABEL_MAP, TAG_CACHE)).toBe('');
  });

  it('works without a labelMap (falls back to raw field names)', () => {
    const miq = { '=': { field: 'Vm-name', value: 'test' } };
    expect(miqExpressionToHuman(miq, null, null))
      .toBe('Vm-name = "test"');
  });

  it('byte suffix in expression value', () => {
    const miq = { '>=': { field: 'Vm-num_cpu', value: '512.megabytes' } };
    expect(miqExpressionToHuman(miq, LABEL_MAP, TAG_CACHE))
      .toBe('VM and Instance : Number of CPUs >= "512 MB"');
  });
});
