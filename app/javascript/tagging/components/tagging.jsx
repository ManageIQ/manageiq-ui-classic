import React from 'react';
import PropTypes from 'prop-types';
import TagModifier from './tagModifier';
import TagView from './tagView';

class Tagging extends React.Component {
  onTagCategoryChange = (selectedTagCategory) => {
    this.props.onTagCategoryChange(selectedTagCategory.value);
  }

  onTagValueChange = (selectedTagValue) => {
    this.props.onTagValueChange({ tagCategory: this.props.selectedTagCategory, tagValue: selectedTagValue.value });
  }

  onTagDeleteClick = (tagCategory, tagValue) => {
    this.props.onTagDeleteClick({ tagCategory, tagValue });
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <TagModifier
            tags={this.props.tags}
            onTagValueChange={this.onTagValueChange}
            onTagCategoryChange={this.onTagCategoryChange}
            selectedTagCategory={this.props.selectedTagCategory}
            selectedTagValue={this.props.selectedTagValue}
          />

          <div className="col-lg-6">
            <TagView setTags={this.props.setTags} onTagDeleteClick={this.onTagDeleteClick} />
          </div>
        </div>
      </div>
    );
  }
}

Tagging.propTypes = {
  selectedTagCategory: PropTypes.string.isRequired,
  selectedTagValue: PropTypes.string.isRequired,
  tags: PropTypes.object,
  setTags: PropTypes.arrayOf(PropTypes.object),
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagCategoryChange: PropTypes.func.isRequired,
  onTagValueChange: PropTypes.func.isRequired,
};

export default Tagging;
