/* eslint-disable react/destructuring-assignment */
import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

/**
 * Render a group of tags in a table.
 */
const TagGroup = ({ title, items, onClick }) => (
  <MiqStructuredList
    rows={items}
    title={title}
    mode="tag_group"
    onClick={(item, event) => onClick(item, event)}
  />
);

export default TagGroup;

TagGroup.propTypes = {
  title: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  items: PropTypes.any.isRequired,
  // eslint-disable-next-line react/require-default-props
  onClick: PropTypes.func,
};
