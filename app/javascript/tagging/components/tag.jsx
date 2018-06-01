import * as React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'patternfly-react';


const Tag = ({
  onTagDeleteClick, tagCategory, tagValue,
}) => (
  <li key={tagValue.id} className="tag">
    <Label
      key={tagValue.id}
      bsStyle="primary"
      onRemoveClick={() => onTagDeleteClick(tagCategory, tagValue)}
      className="tagColor"
    >
      {tagValue.description}
    </Label>
  </li>
);

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: PropTypes.object.isRequired,
  tagValue: PropTypes.object.isRequired,
};

export default Tag;
