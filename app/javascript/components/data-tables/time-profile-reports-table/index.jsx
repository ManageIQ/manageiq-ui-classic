import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../../miq-data-table';
import { tableData } from './helper';

const TimeProfileReportsTable = ({ initialData }) => {
  const { headers, rows } = tableData(initialData);

  if (rows) {
    return (
      rows.rowItems.length > 0 && (
        <MiqDataTable
          rows={rows.rowItems}
          headers={headers}
          mode="time-profile-reports"
        />
      )
    );
  }
  return (
    null
  );
};

TimeProfileReportsTable.propTypes = {
  initialData: PropTypes.arrayOf(PropTypes.any),
};

TimeProfileReportsTable.defaultProps = {
  initialData: [],
};

export default TimeProfileReportsTable;
