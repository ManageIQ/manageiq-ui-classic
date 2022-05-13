import React from 'react';
import PropTypes from 'prop-types';

const BarChartCard = ({ title, chartData }) => (
  <div className="card-pf card-pf-aggregate-status card-pf-accented chart-card">
    <h2 className="card-title">
      {title}
    </h2>
    <div className="card-pf-body">
      <div id="quotas">
        {chartData}
      </div>
    </div>
  </div>
);

BarChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  chartData: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default BarChartCard;
