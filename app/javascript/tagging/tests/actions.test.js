import * as actions from '../actions';
import * as actionsConstants from '../actions/actions';

describe('actions', () => {
  it('should create an action to toggle tag category change', () => {
    const tagCategory = 'category';
    const expectedAction = {
      type: actionsConstants.TOGGLE_TAG_CATEGORY_CHANGE,
      tagCategory,
    };
    expect(actions.toggleTagCategoryChange(tagCategory)).toEqual(expectedAction);
  });

  it('should create an action to toggle tag value change', () => {
    const tag = { tagCategory: 'cat', tagValue: 'val' };
    const expectedAction = {
      type: actionsConstants.TOGGLE_TAG_VALUE_CHANGE,
      tag,
    };
    expect(actions.toggleTagValueChange(tag)).toEqual(expectedAction);
  });

  it('should create an action to delete set tag', () => {
    const tag = { tagCategory: 'cat', tagValue: 'val' };
    const expectedAction = {
      type: actionsConstants.DELETE_ASSIGNED_TAG,
      tag,
    };
    expect(actions.deleteAssignedTag(tag)).toEqual(expectedAction);
  });

  it('should create an action to add set tag', () => {
    const tag = { tagCategory: 'cat', tagValue: 'val' };
    const expectedAction = {
      type: actionsConstants.CHANGE_ASSIGNED_TAGS,
      tag,
    };
    expect(actions.changeAssignedTags(tag)).toEqual(expectedAction);
  });
});
