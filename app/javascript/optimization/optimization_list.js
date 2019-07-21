import React from 'react';
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
  refresh.url = refresh_url;

  if (! columns || ! rows || ! rows.length) {
    return empty();
  }

  return <DataDrivenTable columns={columns} rows={rows} transform={miqOptimizationTransform} />
}

OptimizationList.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.arrayOf(PropTypes.object),
  refresh_url: PropTypes.string,
};
