import * as React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'patternfly-react';
import './tag.scss';

const Tag = ({
  onTagDeleteClick, tagCategory, tagValue,
}) => (
  <li key={`${tagValue.id}`}>
    <Label
      key={tagValue.id}
      bsStyle='primary'
      onRemoveClick={() => { onTagDeleteClick(tagCategory, tagValue); }}
      style={{color: 'white'}}
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
