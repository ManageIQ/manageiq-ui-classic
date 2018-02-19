import { modifySetTags, toggle } from '../reducers/reducers';
import * as actions from '../actions'

describe('modifySetTags reducer', () => {
  it('should return the initial state', () => {
    expect(modifySetTags(undefined, {})).toEqual([])
  })

  it('simple delete set tag', () => {
    expect(modifySetTags([{tagCategory: 'cat', tagValue: 'val'}],
        actions.deleteSetTag({tagCategory: 'cat', tagValue: 'val'}))
      ).toEqual([])
  })

  it('should delete set tag based on category, not value', () => {
    expect(modifySetTags([{tagCategory: 'cat', tagValue: 'val'}, {tagCategory: 'cat2', tagValue: 'val'}],
        actions.deleteSetTag({tagCategory: 'cat', tagValue: 'val2'}))
      ).toEqual([{tagCategory: 'cat2', tagValue: 'val'}])
  })

  it('delete not set tag does nothing', () => {
    expect(modifySetTags([{tagCategory: 'cat', tagValue: 'val'}],
        actions.deleteSetTag({tagCategory: 'cat2', tagValue: 'val'}))
      ).toEqual([{tagCategory: 'cat', tagValue: 'val'}])
  })

  it('simple add set tag', () => {
    expect(modifySetTags([{tagCategory: 'cat', tagValue: 'val'}],
        actions.addSetTag({tagCategory: 'cat2', tagValue: 'val'}))
      ).toEqual([{tagCategory: 'cat', tagValue: 'val'}, {tagCategory: 'cat2', tagValue: 'val'}])
  })

  it('add existing set tag', () => {
    expect(modifySetTags([{tagCategory: 'cat', tagValue: 'val'}],
        actions.addSetTag({tagCategory: 'cat', tagValue: 'val2'}))
      ).toEqual([{tagCategory: 'cat', tagValue: 'val2'}])
  })
})

describe('toggle reducer', () => {
  it('should return the initial state', () => {
    expect(toggle(undefined, {})).toEqual({tagCategory: '', tagValue: ''})
  })

  it('select tag category', () => {
    expect(toggle({tagCategory: '', tagValue: ''}, actions.toggleTagCategoryChange('cat'))
    ).toEqual({ tagCategory: 'cat', tagValue: '' })
  })

  it('select tag category and clear tag value', () => {
    expect(toggle({tagCategory: 'abc', tagValue: 'xaxa'}, actions.toggleTagCategoryChange('cat'))
    ).toEqual({ tagCategory: 'cat', tagValue: '' })
  })

  it('clear tag category', () => {
    expect(toggle({tagCategory: 'abc', tagValue: 'xaxa'}, actions.toggleTagCategoryChange(''))
    ).toEqual({ tagCategory: '', tagValue: '' })
  })

  it('select tag value', () => {
    expect(toggle({tagCategory: 'cat', tagValue: 'xaxa'},
      actions.toggleTagValueChange({tagCategory: 'cat', tagValue: 'val'}))
    ).toEqual({ tagCategory: 'cat', tagValue: 'val' })
  })

  it('select tag value with different category does not change selected category', () => {
    expect(toggle({tagCategory: 'cat', tagValue: 'xaxa'},
      actions.toggleTagValueChange({tagCategory: 'cat2', tagValue: 'val2'}))
    ).toEqual({ tagCategory: 'cat', tagValue: 'val2' })
  })

  it('clear tag value', () => {
    expect(toggle({tagCategory: 'cat', tagValue: 'xaxa'},
      actions.toggleTagValueChange({tagCategory: 'cat', tagValue: ''}))
    ).toEqual({ tagCategory: 'cat', tagValue: '' })
  })
})
