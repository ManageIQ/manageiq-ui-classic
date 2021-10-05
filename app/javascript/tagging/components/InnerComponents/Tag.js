import * as React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'patternfly-react';
import TaggingPropTypes from '../TaggingPropTypes';

const Tag = ({
  onTagDeleteClick, tagCategory, tagValue, truncate, showCloseButton,
}) => {
  if (showCloseButton) {
    return (
      <li key={tagValue.id} className="tag">
        <Label
          key={tagValue.id}
          id={`tag_value_${tagValue.id}`}
          bsStyle="primary"
          onRemoveClick={onTagDeleteClick ? () => onTagDeleteClick(tagCategory, tagValue) : undefined}
          className="tagColor"
          title={tagValue.description}
        >
          {truncate(tagValue.description)}
        </Label>
      </li>
    );
  }
  return (
    <li key={tagValue.id} className="tag">
      <Label
        key={tagValue.id}
        id={`tag_value_${tagValue.id}`}
        className="tagColor"
        title={tagValue.description}
      >
        {truncate(tagValue.description)}
      </Label>
    </li>
  );
};

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func,
  tagCategory: TaggingPropTypes.category,
  tagValue: TaggingPropTypes.value,
  truncate: PropTypes.func.isRequired,
  showCloseButton: PropTypes.bool,
};

export default Tag;
