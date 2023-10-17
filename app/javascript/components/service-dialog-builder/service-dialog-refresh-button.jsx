import React from 'react';
import { Button, Loading } from 'carbon-components-react';
import { Renew16 } from '@carbon/icons-react';
import PropTypes from 'prop-types';

const ServiceDialogRefreshButton = ({ onRefresh, showRefreshButton, fieldName }) => (
  <>
    {showRefreshButton && (
      <Button
        hasIconOnly
        className="refresh-button"
        id="order-service-refresh-button"
        onClick={() => onRefresh()}
        iconDescription={__('Refresh')}
        renderIcon={Renew16}
      />

    )}
    <div className="refreshSpinner" id={`refreshSpinner_${fieldName}`}>
      <Loading active small withOverlay={false} className="loading" />
    </div>
  </>
);
ServiceDialogRefreshButton.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  showRefreshButton: PropTypes.bool.isRequired,
  fieldName: PropTypes.string.isRequired,
};

export default ServiceDialogRefreshButton;
