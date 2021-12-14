import React from 'react';
import PropTypes from 'prop-types';
import { tableData, onSelectRender } from './helper';
import MiqDataTable from '../../miq-data-table';

const DbList = ({
  nodes, activeTree, dashboards, groups, widgets,
}) => {
  const { headers, rows, type } = tableData(nodes, dashboards, groups, widgets);
  console.log(headers);
  console.log(rows);

  /** Function to execute the row's click event */
  const onSelect = (selectedRow) => onSelectRender(type, selectedRow, activeTree, nodes, rows);

  return (
    rows.length > 0 && (
      <MiqDataTable
        rows={rows}
        headers={headers}
        onCellClick={(selectedRow) => onSelect(selectedRow)}
        mode="db-list"
      />
    )
  );
};

export default DbList;

DbList.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTree: PropTypes.string.isRequired,
  dashboards: PropTypes.shape({}),
  groups: PropTypes.arrayOf(PropTypes.any),
  widgets: PropTypes.arrayOf(PropTypes.any),
};

DbList.defaultProps = {
  dashboards: [],
  groups: [{}],
  widgets: [],
};
