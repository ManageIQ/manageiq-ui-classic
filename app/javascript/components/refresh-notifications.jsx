import React from 'react';
import PropTypes from 'prop-types';
import { InlineNotification } from 'carbon-components-react';

const RefreshNotifications = ({
  status,
}) => (
  <div className="refresh-notifications">
    {(!status.last_refresh.stale && status.last_refresh.status !== 'Success') && (
      <InlineNotification
        kind="error"
        role="alert"
        className="last-refresh-notification"
        key="1"
        title={status.last_refresh.label}
        subtitle={(
          <div>
            {status.last_refresh.value.map((error) => (
              <div key={error.value}><span>{error.value}</span></div>
            ))}

          </div>
        )}
        lowContrast
        hideCloseButton
      />
    )}
  </div>

);
RefreshNotifications.propTypes = {
  status: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default RefreshNotifications;
