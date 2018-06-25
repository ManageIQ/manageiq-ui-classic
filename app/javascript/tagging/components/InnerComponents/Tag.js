import * as React from 'react';
import PropTypes from 'prop-types';
import { Label, OverlayTrigger, Tooltip } from 'patternfly-react';
import TaggingPropTypes from '../TaggingPropTypes';

const tooltip = text => <Tooltip id="tooltip">{text}</Tooltip>;

const Tag = ({
  onTagDeleteClick, tagCategory, tagValue, truncate,
}) => (
  <li key={tagValue.id} className="tag">
    <OverlayTrigger placement="bottom" overlay={tooltip(tagValue.description)}>
      <Label
        key={tagValue.id}
        bsStyle="primary"
        onRemoveClick={() => onTagDeleteClick(tagCategory, tagValue)}
        className="tagColor"
      >
        {truncate(tagValue.description)}
      </Label>
    </OverlayTrigger>
  </li>
);

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: TaggingPropTypes.category,
  tagValue: TaggingPropTypes.value,
  truncate: PropTypes.func.isRequired,
};

export default Tag;
