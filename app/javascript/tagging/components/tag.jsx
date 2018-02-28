import * as React from 'react';
import PropTypes from 'prop-types';
import './tag.scss';

const Tag = ({
  onTagDeleteClick, tagCategory, tagValue, srOnly,
}) => (
  <li key={`${tagCategory}: ${tagValue}`}>
    <span className="label label-info">
      {tagCategory}: {tagValue}
      <a
        onClick={(e) => { e.preventDefault(); onTagDeleteClick(tagCategory, tagValue); }}
        href="#"
        className="remove-button"
      >
        <span className="pficon pficon-close" aria-hidden="true" />
        <span className="sr-only">{srOnly}</span>
      </a>
    </span>
  </li>
);

Tag.propTypes = {
  onTagDeleteClick: PropTypes.func.isRequired,
  tagCategory: PropTypes.string.isRequired,
  tagValue: PropTypes.string.isRequired,
  srOnly: PropTypes.string,
};

Tag.defaultProps = {
  srOnly: 'Remove',
};

export default Tag;
