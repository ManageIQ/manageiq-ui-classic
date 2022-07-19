import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

export default function MultilinkTable(props) {
  const { title, items } = props;

  return (
    <MiqStructuredList
      rows={items}
      title={title}
      mode="multilink_table"
      onClick={(item, event) => props.onClick(item, event)}
    />
  );
}

MultilinkTable.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
  onClick: PropTypes.func.isRequired,
};
