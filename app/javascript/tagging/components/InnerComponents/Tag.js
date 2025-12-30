import * as React from 'react';
import PropTypes from 'prop-types';
import { FormLabel, Button } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import TaggingPropTypes from '../TaggingPropTypes';

const Tag = ({
  onTagDeleteClick, tagCategory, tagValue, truncate, showCloseButton,
}) => {
  if (showCloseButton) {
    return (
      <li key={tagValue.id} className="tag">
        <FormLabel
          key={tagValue.id}
          id={`tag_value_${tagValue.id}`}
          className="tagColor"
          title={tagValue.description}
        >
          <div className="value-label">
            <span className="value-span">
              {truncate(tagValue.description)}
            </span>
            <Button
              size="sm"
              className="tagButton"
              renderIcon={(props) => <Close size={16} {...props} />}
              iconDescription={__('Close Icon')}
              hasIconOnly
              onClick={onTagDeleteClick ? () => onTagDeleteClick(tagCategory, tagValue) : undefined}
            />
          </div>
        </FormLabel>
      </li>
    );
  }
  return (
    <li key={tagValue.id} className="tag">
      <FormLabel
        key={tagValue.id}
        id={`tag_value_${tagValue.id}`}
        className="tagColor"
        title={tagValue.description}
      >
        <div className="value-label">
          {truncate(tagValue.description)}
        </div>
      </FormLabel>
    </li>
  );
};

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: TaggingPropTypes.category,
  tagValue: TaggingPropTypes.value,
  truncate: PropTypes.func.isRequired,
  showCloseButton: PropTypes.bool,
};

Tag.defaultProps = {
  tagCategory: undefined,
  tagValue: undefined,
  showCloseButton: false,
};

export default Tag;
