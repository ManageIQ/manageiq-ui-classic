import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from '@carbon/react';

const RefreshNotifications = ({ status }) => (
  <div className="refresh-notifications">
    <InlineNotification
      kind={status.last_refresh.status}
      role="alert"
      className="last-refresh-notification"
      title={status.last_refresh.label}
      lowContrast
      hideCloseButton
    >
      <div>
        {status.last_refresh.value.map((item) => (
          <div key={item.value}>{item.value}</div>
        ))}
      </div>
    </InlineNotification>
  </div>
);
RefreshNotifications.propTypes = {
  status: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RefreshNotifications;
