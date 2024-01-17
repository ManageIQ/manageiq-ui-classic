/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import PropTypes from 'prop-types';
import MiqStructuredList from '../miq-structured-list';

export default function TableListView(props) {
  const { headers, values, title } = props;

  /** Function to generate rows for structured list. */
  const miqListRows = (list) => {
    const headerKeys = props.headers.map((item) => (item.key));
    return list.map((item) => (headerKeys.map((header) => item[header])));
  };

  return (
    <MiqStructuredList
      headers={headers.map((item) => item.label)}
      rows={miqListRows(values)}
      title={title}
      mode="table_list_view"
      onClick={() => props.onClick}
    />
  );
}

TableListView.propTypes = {
  title: PropTypes.string.isRequired,
  headers: PropTypes.arrayOf(PropTypes.any).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func.isRequired,
};
