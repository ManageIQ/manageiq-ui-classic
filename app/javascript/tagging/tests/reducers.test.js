import { modifyAssignedTags, toggle } from '../reducers/reducers';
import * as actions from '../actions';

describe('modifyAssignedTags reducer', () => {
  it('should return the initial state', () => {
    expect(modifyAssignedTags(undefined, {})).toEqual([]);
  });

  it('simple delete set tag', () => {
    expect(modifyAssignedTags(
      [{ description: 'Name', id: 1, values: [{ description: 'Pepa', id: 11 }] }],
      actions.deleteAssignedTag({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }),
    )).toEqual([]);
  });

  it('should delete only one tag value if multiple present', () => {
    expect(modifyAssignedTags(
      [{  description: 'Name', id: 1, values: [{ description: 'Pepa', id: 11 }, { description: 'Franta', id: 12 }] }],
      actions.deleteAssignedTag({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }),
    )).toEqual([{ description: 'Name', id: 1, values: [{ description: 'Franta', id: 12 }] }]);
  });

  it('delete not assigned tag does nothing', () => {
    expect(modifyAssignedTags(
      [{ description: 'Name', id: 1, values: [{ description: 'Franta', id: 12 }] }],
      actions.deleteAssignedTag({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }),
    )).toEqual([{ description: 'Name', id: 1, values: [{ description: 'Franta', id: 12 }] }]);
  });

  it('simple add new tag', () => {
    expect(modifyAssignedTags(
      [],
      actions.addAssignedTag({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }),
    )).toEqual([{ description: 'Name', id: 1, values: [{ description: 'Pepa', id: 11 }] }]);
  });

  it('add to existing tag', () => {
    expect(modifyAssignedTags(
      [{ description: 'Name', id: 1, values: [{ description: 'Franta', id: 12 }] }],
      actions.addAssignedTag({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }),
    )).toEqual([{ description: 'Name', id: 1, values: [{ description: 'Franta', id: 12 }, { description: 'Pepa', id: 11 }] }]);
  });
});

describe('toggle reducer', () => {
  it('should return the initial state', () => {
    expect(toggle(undefined, {})).toEqual({ tagCategory: {}, tagValue: {} });
  });

  it('select tag category', () => {
    expect(toggle({ tagCategory: {}, tagValue: {} }, actions.toggleTagCategoryChange({ description: 'Name', id: 1 }))).toEqual({ tagCategory: { description: 'Name', id: 1 }, tagValue: {} });
  });

  it('select tag category and clear tag value', () => {
    expect(toggle({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }, actions.toggleTagCategoryChange({ description: 'Name', id: 1 }))).toEqual({ tagCategory: { description: 'Name', id: 1 }, tagValue: {} });
  });

  it('clear tag category', () => {
    expect(toggle({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }, actions.toggleTagCategoryChange({}))).toEqual({ tagCategory: {}, tagValue: {} });
  });

  it('select tag value', () => {
    expect(toggle(
      { tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Franta', id: 12 } },
      actions.toggleTagValueChange({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } }),
    )).toEqual({ tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Pepa', id: 11 } });
  });

  it('clear tag value', () => {
    expect(toggle(
      { tagCategory: { description: 'Name', id: 1 }, tagValue: { description: 'Franta', id: 12 } },
      actions.toggleTagValueChange({ tagCategory: { description: 'Name', id: 1 }, tagValue: {} }),
    )).toEqual({ tagCategory: { description: 'Name', id: 1 }, tagValue: {} });
  });
});
