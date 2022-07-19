import React from 'react';
import PropTypes from 'prop-types';

const EmptyCard = ({ title }) => (
  <div className="card-pf card-pf-aggregate-status card-pf-accented chart-card">
    <h2 className="card-title">
      {title}
    </h2>
    <div className="card-pf-body">
      <div className="empty-chart-content">
        <span className="pficon pficon-info" />
        <span>{__('No data available')}</span>
      </div>
    </div>
  </div>
);

EmptyCard.propTypes = {
  title: PropTypes.string.isRequired,
};

export default EmptyCard;
