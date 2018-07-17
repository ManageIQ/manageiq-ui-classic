import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'patternfly-react';
import Tag from './Tag';
import TaggingPropTypes from '../TaggingPropTypes';

class TagCategory extends React.Component {
  generateTag = tagValue => (
    <Tag
      key={tagValue.id}
      tagCategory={this.props.tagCategory}
      tagValue={tagValue}
      onTagDeleteClick={this.props.onTagDeleteClick}
      truncate={this.props.valueTruncate}
    />
  );

  render() {
    const values = [...this.props.values];
    const categoryTooltip = (
      <Tooltip id="tooltip">{this.props.tagCategory.description}</Tooltip>
    );
    return (
      <ul className="tag-category list-inline">
        <li key={this.props.tagCategory.id}>
          <OverlayTrigger placement="bottom" overlay={categoryTooltip}>
            <div className="category-label">
              {this.props.categoryTruncate(this.props.tagCategory.description)}
            </div>
          </OverlayTrigger>
        </li>
        {values
          .sort((a, b) => (a.description < b.description ? -1 : 1))
          .map(tagValue => this.generateTag(tagValue))}
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
};

TagCategory.defaultProps = {
  categoryTruncate: str =>
    (str.length > 18 ? `${str.substring(0, 18)}...` : str),
  valueTruncate: str => (str.length > 18 ? `${str.substring(0, 18)}...` : str),
};

export default TagCategory;
