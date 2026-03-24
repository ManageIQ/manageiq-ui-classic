import { modifyAssignedTags, toggle } from '../reducers/reducers';
import * as actions from '../actions';

describe('modifyAssignedTags reducer', () => {
  it('should return the initial state', () => {
    expect(modifyAssignedTags(undefined, {})).toEqual([]);
  });

  it('simple delete set tag', () => {
    expect(modifyAssignedTags(
      [{ label: 'Name', id: 1, values: [{ label: 'Pepa', id: 11 }] }],
      actions.deleteAssignedTag({ tagCategory: { label: 'Name', id: 1 }, tagValue: { label: 'Pepa', id: 11 } }),
    )).toEqual([]);
  });

  it('should delete only one tag value if multiple present', () => {
    expect(modifyAssignedTags(
      [{  label: 'Name', id: 1, values: [{ label: 'Pepa', id: 11 }, { label: 'Franta', id: 12 }] }],
      actions.deleteAssignedTag({ tagCategory: { label: 'Name', id: 1 }, tagValue: { label: 'Pepa', id: 11 } }),
    )).toEqual([{ label: 'Name', id: 1, values: [{ label: 'Franta', id: 12 }] }]);
  });

  it('delete not assigned tag does nothing', () => {
    expect(modifyAssignedTags(
      [{ label: 'Name', id: 1, values: [{ label: 'Franta', id: 12 }] }],
      actions.deleteAssignedTag({ tagCategory: { label: 'Name', id: 1 }, tagValue: { label: 'Pepa', id: 11 } }),
    )).toEqual([{ label: 'Name', id: 1, values: [{ label: 'Franta', id: 12 }] }]);
  });

  it('simple add new tag', () => {
    expect(modifyAssignedTags(
      [],
      actions.changeAssignedTags({ tagCategory: { label: 'Name', id: 1 }, tagValue: [{ label: 'Pepa', id: 11 }] }),
    )).toEqual([{ label: 'Name', id: 1, values: [{ label: 'Pepa', id: 11 }] }]);
  });

  it('add to existing tag', () => {
    expect(modifyAssignedTags(
      [{ label: 'Name', id: 1, values: [{ label: 'Franta', id: 12 }] }],
      actions.changeAssignedTags({ tagCategory: { label: 'Name', id: 1 }, tagValue: [{ label: 'Franta', id: 12 }, { label: 'Pepa', id: 11 }] }),
    )).toEqual([{ label: 'Name', id: 1, values: [{ label: 'Franta', id: 12 }, { label: 'Pepa', id: 11 }] }]);
  });
});

describe('toggle reducer', () => {
  it('should return the initial state', () => {
    expect(toggle(undefined, {})).toEqual({ tagCategory: {}, tagValue: {} });
  });

  it('select tag category', () => {
    expect(toggle({ tagCategory: {}, tagValue: {} }, actions.toggleTagCategoryChange({ label: 'Name', id: 1 }))).toEqual({ tagCategory: { label: 'Name', id: 1 }, tagValue: {} });
  });

  it('select tag category and clear tag value', () => {
    expect(toggle({ tagCategory: { label: 'Name', id: 1 }, tagValue: { label: 'Pepa', id: 11 } }, actions.toggleTagCategoryChange({ label: 'Name', id: 1 }))).toEqual({ tagCategory: { label: 'Name', id: 1 }, tagValue: {} });
  });

  it('clear tag category', () => {
    expect(toggle({ tagCategory: { label: 'Name', id: 1 }, tagValue: { label: 'Pepa', id: 11 } }, actions.toggleTagCategoryChange({}))).toEqual({ tagCategory: {}, tagValue: {} });
  });

  it('select tag value', () => {
    expect(toggle(
      { tagCategory: { label: 'Name', id: 1 }, tagValue: [{ label: 'Franta', id: 12 }] },
      actions.toggleTagValueChange({ tagCategory: { label: 'Name', id: 1 }, tagValue: [{ label: 'Pepa', id: 11 }] }),
    )).toEqual({ tagCategory: { label: 'Name', id: 1 }, tagValue: { label: 'Pepa', id: 11 } });
  });

  it('clear tag value', () => {
    expect(toggle(
      { tagCategory: { label: 'Name', id: 1 }, tagValue: [{ label: 'Franta', id: 12 }] },
      actions.toggleTagValueChange({ tagCategory: { label: 'Name', id: 1 }, tagValue: [{}] }),
    )).toEqual({ tagCategory: { label: 'Name', id: 1 }, tagValue: {} });
  });
});
