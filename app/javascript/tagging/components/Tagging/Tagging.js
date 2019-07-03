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

    // Single Tag Only
    if (this.props.options && this.props.options.onlySingleTag) {
      this.props.onSingleTagValueChange(action);
      return;
    }

    if (this.findSelectedTag(this.props.selectedTagCategory).singleValue) {
      this.props.onTagValueChange(action, this.props.options);
    } else {
      this.props.onTagMultiValueChange(action, this.props.options);
    }
  };

  onTagCategoryChange = selectedTagCategory =>
    this.props.onTagCategoryChange(selectedTagCategory);

  onTagDeleteClick = (tagCategory, tagValue) => {
    this.props.onTagDeleteClick({ tagCategory, tagValue }, this.props.options);
  };

  getvalues = () =>
    (this.findSelectedTag(this.props.selectedTagCategory) &&
      this.findSelectedTag(this.props.selectedTagCategory).values) ||
    [];

  findSelectedTag = (selectedTagCategory = { id: undefined }) =>
    this.props.tags.find(tag => tag.id === selectedTagCategory.id);

  isSelectedCategoryMultiValue = selectedTagCategory =>
    (this.findSelectedTag(selectedTagCategory.id) &&
      this.findSelectedTag(selectedTagCategory.id).singleValue) === true;

  tagCategories = this.props.tags.map(tag => ({
    description: tag.description,
    id: tag.id,
    singleValue: tag.singleValue,
  })) || [];

  render() {
    return (
      <Grid>
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
                selectedTagValue={this.props.selectedTagValue}
                multiValue={this.isSelectedCategoryMultiValue(this.props.selectedTagCategory)}
                values={this.getvalues()}
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
  selectedTagValue: TaggingPropTypes.value,
  tags: TaggingPropTypes.tags,
  assignedTags: TaggingPropTypes.tags,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
  onTagMultiValueChange: PropTypes.func.isRequired,
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
