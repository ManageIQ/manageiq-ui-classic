/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Column } from 'carbon-components-react';
import TagModifier from '../InnerComponents/TagModifier';
import TagView from '../InnerComponents/TagView';
import CategoryModifier from '../InnerComponents/CategoryModifier';
import ValueModifier from '../InnerComponents/ValueModifier';
import TaggingPropTypes from '../TaggingPropTypes';

class Tagging extends React.Component {
  // eslint-disable-next-line react/sort-comp
  onTagValueChange = (selectedTagValue) => {
    const {
      selectedTagCategory, options,
    } = this.props;
    const action = {
      tagCategory: selectedTagCategory,
      tagValue: selectedTagValue,
    };

    if (options && options.onlySingleTag) {
      this.props.onSingleTagValueChange(action, options);
    } else {
      this.props.onTagValueChange(action, options);
    }
  };

  onTagCategoryChange = (selectedTagCategory) =>
    this.props.onTagCategoryChange(selectedTagCategory);

  onTagDeleteClick = (tagCategory, tagValue) => {
    this.props.onTagDeleteClick({ tagCategory, tagValue }, this.props.options);
  };

  getCategoryValues = () =>
    (this.findSelectedTag(this.props.selectedTagCategory)
      && this.findSelectedTag(this.props.selectedTagCategory).values)
    || [];

  getSelectedCategoryValues = () =>
    this.props.assignedTags.find((tag) => tag.id === this.props.selectedTagCategory.id)
    || { values: [] };

  findSelectedTag = (selectedTagCategory = { id: undefined }) =>
    this.props.tags.find((tag) => tag.id === selectedTagCategory.id);

  isMulti = (selectedTagCategory) => {
    const selectedCategory = this.findSelectedTag(selectedTagCategory);
    if (selectedCategory && selectedCategory.singleValue) {
      return !selectedCategory.singleValue;
    }
    return true;
  }

  // eslint-disable-next-line react/destructuring-assignment
  tagCategories = this.props.tags.map((tag) => ({
    description: tag.description,
    id: tag.id,
    singleValue: tag.singleValue,
  })) || [];

  render() {
    const {
      options, selectedTagCategory, onTagCategoryChange, assignedTags,
    } = this.props;
    const isDisabled = options && options.isDisabled;
    return (
      <Row className="tagging-row-wrapper tagging-form">
        <Column className="tagging-block-outer">
          <TagModifier hideHeader={options && options.hideHeaders}>
            <CategoryModifier
              selectedTagCategory={selectedTagCategory}
              onTagCategoryChange={onTagCategoryChange}
              tagCategories={this.tagCategories}
              isDisabled={isDisabled}
            />
            <ValueModifier
              selectedTagCategory={selectedTagCategory}
              onTagValueChange={this.onTagValueChange}
              selectedTagValues={this.getSelectedCategoryValues().values}
              multiValue={this.isMulti(selectedTagCategory)}
              values={this.getCategoryValues()}
              isDisabled={isDisabled}
            />
          </TagModifier>
        </Column>
        <Column className="tagging-block-outer">
          <TagView
            hideHeader={options && options.hideHeaders}
            assignedTags={assignedTags}
            onTagDeleteClick={isDisabled ? () => {} : this.onTagDeleteClick}
            showCloseButton={!isDisabled}
          />
        </Column>
      </Row>
    );
  }
}

Tagging.propTypes = {
  selectedTagCategory: TaggingPropTypes.category,
  tags: TaggingPropTypes.tags,
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  onSingleTagValueChange: PropTypes.func.isRequired,
  options: PropTypes.shape({
    onlySingleTag: PropTypes.bool,
    hideHeaders: PropTypes.bool,
    isDisabled: PropTypes.bool,
  }),
};

Tagging.defaultProps = {
  selectedTagCategory: {},
  tags: [],
  assignedTags: [],
  options: {
    onlySingleTag: false,
    hideHeaders: false,
    isDisabled: false,
  },
};

export default Tagging;
