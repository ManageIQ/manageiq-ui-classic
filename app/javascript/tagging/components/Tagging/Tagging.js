import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col } from 'patternfly-react';
import TagModifier from '../InnerComponents/TagModifier';
import TagView from '../InnerComponents/TagView';
import CategoryModifier from '../InnerComponents/CategoryModifier';
import ValueModifier from '../InnerComponents/ValueModifier';
import TaggingPropTypes from '../TaggingPropTypes';

class Tagging extends React.Component {
  onTagValueChange = (selectedTagValue) => {
    const action = {
      tagCategory: this.props.selectedTagCategory,
      tagValue: selectedTagValue,
    };

    if (this.props.options && this.props.options.onlySingleTag) {
      this.props.onSingleTagValueChange(action);
    } else {
      this.props.onTagValueChange(action, this.props.options);
    }
  };

  onTagCategoryChange = selectedTagCategory =>
    this.props.onTagCategoryChange(selectedTagCategory);

  onTagDeleteClick = (tagCategory, tagValue) => {
    this.props.onTagDeleteClick({ tagCategory, tagValue }, this.props.options);
  };

  getCategoryValues = () =>
    (this.findSelectedTag(this.props.selectedTagCategory) &&
      this.findSelectedTag(this.props.selectedTagCategory).values) ||
    [];

  getSelectedCategoryValues = () =>
    this.props.assignedTags.find(tag => tag.id === this.props.selectedTagCategory.id) ||
    { values: [] };

  findSelectedTag = (selectedTagCategory = { id: undefined }) =>
    this.props.tags.find(tag => tag.id === selectedTagCategory.id);

  isMulti = selectedTagCategory =>
    this.findSelectedTag(selectedTagCategory) &&
    this.findSelectedTag(selectedTagCategory).singleValue === false;

  tagCategories = this.props.tags.map(tag => ({
    description: tag.description,
    id: tag.id,
    singleValue: tag.singleValue,
  })) || [];

  render() {
    return (
      <Grid fluid>
        <Row>
          <Col xs={12} md={8} lg={6}>
            <TagModifier hideHeader={this.props.options && this.props.options.hideHeaders}>
              <CategoryModifier
                selectedTagCategory={this.props.selectedTagCategory}
                onTagCategoryChange={this.props.onTagCategoryChange}
                tagCategories={this.tagCategories}
              />
              <ValueModifier
                onTagValueChange={this.onTagValueChange}
                selectedTagValues={this.getSelectedCategoryValues().values}
                multiValue={this.isMulti(this.props.selectedTagCategory)}
                values={this.getCategoryValues()}
              />
            </TagModifier>
          </Col>
          <Col xs={12} md={4} lg={6}>
            <TagView
              hideHeader={this.props.options && this.props.options.hideHeaders}
              assignedTags={this.props.assignedTags}
              onTagDeleteClick={this.onTagDeleteClick}
            />
          </Col>
        </Row>
      </Grid>
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
  }),
};

Tagging.defaultProps = {
  options: {
    onlySingleTag: false,
    hideHeaders: false,
  },
};

export default Tagging;
