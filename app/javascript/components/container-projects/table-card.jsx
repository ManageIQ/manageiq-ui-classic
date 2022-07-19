import React from 'react';
import PropTypes from 'prop-types';
import MiqDataTable from '../miq-data-table';

const TableCard = ({ title, chartData }) => (
  <div className="card-pf card-pf-aggregate-status card-pf-accented chart-card">
    <h2 className="card-title">
      {__(title)}
    </h2>
    <div className="card-pf-body">
      <div id="pods-table">
        <MiqDataTable
          rows={chartData.rows}
          headers={chartData.headers}
        />
      </div>
    </div>
  </div>
);

TableCard.propTypes = {
  title: PropTypes.string.isRequired,
  chartData: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default TableCard;
