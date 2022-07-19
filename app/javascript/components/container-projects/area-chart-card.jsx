import React from 'react';
import PropTypes from 'prop-types';
import { AreaChart } from '@carbon/charts-react';

const AreaChartCard = ({
  title, textNumber, textUnit, textTitle, chartData, options,
}) => (
  <div className="card-pf card-pf-aggregate-status card-pf-accented chart-card">
    <h2 className="card-title">
      {title}
    </h2>
    <div className="card-pf-body">
      <div className="card-text">
        {textNumber}
        <div className="card-text-units">
          {textUnit}
        </div>
        <div className="card-text-label">
          {textTitle}
        </div>
      </div>
      <div className="area-chart">
        <AreaChart data={chartData} options={options} />
      </div>
    </div>
  </div>
);

AreaChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  textNumber: PropTypes.number.isRequired,
  textUnit: PropTypes.string.isRequired,
  textTitle: PropTypes.string.isRequired,
  chartData: PropTypes.arrayOf(PropTypes.any).isRequired,
  options: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AreaChartCard;
