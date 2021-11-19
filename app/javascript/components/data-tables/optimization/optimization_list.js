import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { refresh } from './refresh';
import MiqDataTable from '../../miq-data-table';
import { tableData } from './helper';
import { miqOptimizationTransform } from './transform';

const Empty = () => (
  <div className="alert alert-info">
    <span className="pficon pficon-info" />
    <strong>
      {__('No Records Found.')}
    </strong>
  </div>
);

export default function OptimizationList({
  columns, rows, refreshUrl,
}) {
  const [state, set] = useState({
    columns,
    rows,
  });

  refresh.url = refreshUrl;
  refresh.set = set;

  if (!state.columns || !state.rows || !state.rows.length) {
    return <Empty />;
  }

  /** Function to execute the row's click event */
  const onSelect = (selectedRow) => {
    const item = rows.find((row) => row.id === selectedRow.id);
    if (item) {
      window.DoNav(item.url);
    }
  };

  const transformedRows = state.rows.map(miqOptimizationTransform).map((item) => (
    {
      ...item,
      clickable: true,
    }));
  const { miqColumns, miqRows } = tableData(state.columns, transformedRows);

  return (
    <MiqDataTable
      headers={miqColumns}
      rows={miqRows}
      onCellClick={(selectedRow) => onSelect(selectedRow)}
      mode="optimization-list"
    />
  );
}

OptimizationList.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.any),
  rows: PropTypes.arrayOf(PropTypes.object),
  refreshUrl: PropTypes.string,
};

OptimizationList.defaultProps = {
  columns: [],
  rows: [],
  refreshUrl: '',
};
