import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

export default function GenericGroup(props) {
  const { title, items } = props;
  return (
    <MiqStructuredList
      rows={items}
      title={title}
      mode="generic_group"
      onClick={(item, event) => props.onClick(item, event)}
    />
  );
}

GenericGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};
