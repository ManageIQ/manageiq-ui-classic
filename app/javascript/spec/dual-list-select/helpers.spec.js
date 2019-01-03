import {
  isEmpty,
  leftValues,
  leftSubmittedKeys,
  addedLeftKeys,
  addedRightKeys,
} from '../../components/dual-list-select/helpers';

describe('Dual list select helpers', () => {
  describe('isEmpty', () => {
    it('should return true if object is empty ', () => {
      expect(isEmpty({})).toEqual(true);
    });

    it('should return false if object is not empty ', () => {
      expect(isEmpty({ foo: 'bar' })).toEqual(false);
    });

    it('should return true if object is empty string', () => {
      expect(isEmpty('')).toEqual(true);
    });

    it('should return false if object is not empty string', () => {
      expect(isEmpty('bar')).toEqual(false);
    });
  });

  describe('form helpers', () => {
    let options;
    let value;

    beforeEach(() => {
      options = {
        key1: 'text1',
        key2: 'text2',
        key3: 'text3',
        key4: 'text4',
      };
      value = { key3: 'text3' };
    });

    describe('leftValues', () => {
      it('returns all left values (all options in the left list)', () => {
        expect(leftValues(options, value)).toEqual({
          key1: 'text1',
          key2: 'text2',
          key4: 'text4',
        });
      });
    });

    describe('leftSubmittedKeys', () => {
      it('returns keys of left submitted values', () => {
        expect(leftSubmittedKeys(options, value)).toEqual(['key1', 'key2', 'key4']);
      });
    });

    describe('addedLeftKeys', () => {
      it('returns only added keys to left list', () => {
        const originalLeftValues = leftValues(options, value);
        value = { };
        expect(addedLeftKeys(options, value, originalLeftValues)).toEqual(['key3']);
      });
    });

    describe('addedRightKeys', () => {
      it('returns only added keys to right list', () => {
        const newValue = { key3: 'text3', key4: 'text4' };
        expect(addedRightKeys(newValue, value)).toEqual(['key4']);
      });
    });
  });
});
