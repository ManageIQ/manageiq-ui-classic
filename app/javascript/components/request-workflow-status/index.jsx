import React from 'react';
import PropTypes from 'prop-types';
import RequestWorkflowStatusItem from './request-workflow-status-item';

/** Component to render the Workflow status in /miq_request/show/#{id} page */
const RequestWorkflowStatus = ({ ids }) => (
  <div className="workflow-states-list-container">
    { ids.map((id) => (
      <RequestWorkflowStatusItem recordId={id} key={id} />
    ))}
  </div>
);

RequestWorkflowStatus.propTypes = {
  ids: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default RequestWorkflowStatus;
