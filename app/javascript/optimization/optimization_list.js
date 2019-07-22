import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { DataDrivenTable } from '../components/simple-table/simple-table.jsx';
import { miqOptimizationTransform } from '../optimization/transform.js';
import { refresh } from './refresh.js';

const empty = () => (
  <div className="alert alert-info">
    <span className="pficon pficon-info"></span>
    <strong>
      {__("No Records Found.")}
    </strong>
  </div>
)

export default function OptimizationList({columns, rows, refresh_url, ...props}) {
  const [state, set] = useState({
    columns,
    rows,
  });

  refresh.url = refresh_url;
  refresh.set = set;

  if (! state.columns || ! state.rows || ! state.rows.length) {
    return empty();
  }

  return <DataDrivenTable columns={state.columns} rows={state.rows} transform={miqOptimizationTransform} />
}

OptimizationList.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.arrayOf(PropTypes.object),
  refresh_url: PropTypes.string,
};
