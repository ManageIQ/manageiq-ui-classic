import * as React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'patternfly-react'
import './tag.scss';

const Tag = ({
  onTagDeleteClick, tagCategory, tagValue, srOnly,
}) => (
  <li key={`${tagValue.id}`}>
    <Label
      key={tagValue.id}
      style={{ margin: '0 5px 0 0' }}
      onRemoveClick={(e) => { onTagDeleteClick(tagCategory, tagValue); }}
    >
      {tagValue.description}
    </Label>
  </li>
);

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: PropTypes.object.isRequired,
  tagValue: PropTypes.object.isRequired,
  srOnly: PropTypes.string,
};

Tag.defaultProps = {
  srOnly: 'Remove',
};

export default Tag;
