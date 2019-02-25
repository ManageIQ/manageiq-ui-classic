import { getKeys, filterOptions, filterValues } from '../../components/dual-list-select/helpers';

describe('Dual list select helpers', () => {
  let options;
  let value;
  let originalValue;

  beforeEach(() => {
    options = [
      { key: 'key1', label: 'text1' },
      { key: 'key2', label: 'text2' },
      { key: 'key3', label: 'text3' },
      { key: 'key4', label: 'text4' },
    ];
    value = ['key3'];
    originalValue = [
      { key: 'key3', label: 'text3' },
    ];
  });

  describe('getKeys', () => {
    it('returns keys of array', () => {
      expect(getKeys(options)).toEqual(['key1', 'key2', 'key3', 'key4']);
    });
  });

  describe('filterOptions', () => {
    it('returns all left values (all options in the left list)', () => {
      expect(filterOptions(options, value)).toEqual(
        [
          { key: 'key1', label: 'text1' },
          { key: 'key2', label: 'text2' },
          { key: 'key4', label: 'text4' },
        ],
      );
    });

    it('returns only added values to left list', () => {
      const newValue = [];
      expect(filterOptions(originalValue, newValue)).toEqual(
        [{ key: 'key3', label: 'text3' }],
      );
    });
  });

  describe('filterValues', () => {
    it('returns only added values to right list', () => {
      const newValue = [
        'key3',
        'key4',
      ];
      expect(filterValues(newValue, value)).toEqual(
        [
          'key4',
        ],
      );
    });
  });
});
