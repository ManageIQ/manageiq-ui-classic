import {
  getKeys,
  filterOptions,
  addedLeftValues,
} from '../../components/dual-list-select/helpers';

describe('Dual list select helpers', () => {
  let options;
  let value;

  beforeEach(() => {
    options = [
      { key: 'key1', label: 'text1' },
      { key: 'key2', label: 'text2' },
      { key: 'key3', label: 'text3' },
      { key: 'key4', label: 'text4' },
    ];
    value = [{ key: 'key3', label: 'text3' }];
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

    it('returns only added values to right list', () => {
      const newValue = [
        { key: 'key3', label: 'text3' },
        { key: 'key4', label: 'text4' },
      ];
      expect(filterOptions(newValue, value)).toEqual(
        [
          { key: 'key4', label: 'text4' },
        ],
      );
    });
  });

  describe('addedLeftValues', () => {
    it('returns only added values to left list', () => {
      const originalLeftValues = filterOptions(options, value);
      value = [];
      expect(addedLeftValues(options, value, originalLeftValues)).toEqual(
        [{ key: 'key3', label: 'text3' }],
      );
    });
  });
});
