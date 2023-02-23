/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';

export default function DataTable(props) {
  const { rows, headers } = props;

  return (
    <MiqDataTable
      headers={headers}
      rows={rows}
      mode="data_table"
      onClick={() => props.onClick}
    />
  );
}

DataTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ value: PropTypes.string.isRequired, sortable: PropTypes.string }),
  ])),
  rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.any)),
  onClick: PropTypes.func.isRequired,
};

DataTable.defaultProps = {
  rows: [],
  headers: '',
};
