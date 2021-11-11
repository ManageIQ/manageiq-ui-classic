/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import Tag from './Tag';
import TaggingPropTypes from '../TaggingPropTypes';

class TagCategory extends React.Component {
  generateTag = (tagValue) => (
    <Tag
      key={tagValue.id}
      tagCategory={this.props.tagCategory}
      tagValue={tagValue}
      onTagDeleteClick={this.props.onTagDeleteClick}
      truncate={this.props.valueTruncate}
      showCloseButton={this.props.showCloseButton}
    />
  );

  render() {
    const values = [...this.props.values];
    return (
      <ul className="tag-category list-inline">
        <li key={this.props.tagCategory.id} id={`tag_category_${this.props.tagCategory.id}`}>
          <div className="category-label" title={this.props.tagCategory.description}>
            {this.props.categoryTruncate(this.props.tagCategory.description)}
          </div>
        </li>
        {values
          .sort((a, b) => (a.description < b.description ? -1 : 1))
          .map((tagValue) => this.generateTag(tagValue))}
      </ul>
    );
  }
}

TagCategory.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: TaggingPropTypes.category,
  values: PropTypes.arrayOf(TaggingPropTypes.category).isRequired,
  categoryTruncate: PropTypes.func,
  valueTruncate: PropTypes.func,
  showCloseButton: PropTypes.bool,
};

TagCategory.defaultProps = {
  tagCategory: undefined,
  categoryTruncate: (str) =>
    (str.length > 18 ? `${str.substring(0, 18)}...` : str),
  valueTruncate: (str) => (str.length > 18 ? `${str.substring(0, 18)}...` : str),
  showCloseButton: true,
};

export default TagCategory;
