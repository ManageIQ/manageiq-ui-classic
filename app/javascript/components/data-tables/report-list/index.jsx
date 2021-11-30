import React from 'react';
import PropTypes from 'prop-types';
import { reportListData } from './helper';
import MiqDataTable from '../../miq-data-table';

const ReportList = ({
  nodes, reportMenu, reportTitle, reportDetails,
}) => {
  const { headers, rows } = reportListData(nodes, reportMenu, reportTitle, reportDetails);

  /** Function to execute the row's click event */
  const onSelect = (selectedRow) => {
    const item = rows.find((rowItem) => rowItem.id === selectedRow.id);
    if (item) {
      miqTreeActivateNode('reports_tree', item.nodeKey);
    }
  };

  return (
    <MiqDataTable
      rows={rows}
      headers={headers}
      onCellClick={(selectedRow) => onSelect(selectedRow)}
      mode="report-list"
    />
  );
};

export default ReportList;

ReportList.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.any),
  reportMenu: PropTypes.arrayOf(PropTypes.any),
  reportTitle: PropTypes.string,
  reportDetails: PropTypes.shape({}),
};

ReportList.defaultProps = {
  nodes: [],
  reportMenu: [],
  reportTitle: '',
  reportDetails: {},
};
