import React, { useContext } from 'react';
import { Button, Loading } from 'carbon-components-react';
import { Renew16 } from '@carbon/icons-react';
import PropTypes from 'prop-types';
import OrderServiceContext from './OrderServiceContext';

const OrderServiceRefreshButton = ({ data }) => {
  const { currentRefreshField, setCurrentRefreshField } = useContext(OrderServiceContext);

  return (
    <>
      {data.showRefreshButton && (
        <Button
          hasIconOnly
          className="refresh-button"
          disabled={!data.disabled ? currentRefreshField === data.fieldName : true}
          id="order-service-refresh-button"
          onClick={() => setCurrentRefreshField(data.fieldName)}
          iconDescription={__('Refresh')}
          renderIcon={Renew16}
        />
      )}
      {currentRefreshField === data.fieldName && (
        <div className="refreshSpinner" id={`refreshSpinner_${data.fieldName}`}>
          <Loading active small withOverlay={false} className="loading" />
        </div>
      )}
    </>
  );
};

OrderServiceRefreshButton.propTypes = {
  data: PropTypes.shape({
    showRefreshButton: PropTypes.bool.isRequired,
    fieldName: PropTypes.string.isRequired,
    tabIndex: PropTypes.number.isRequired,
    updateRefreshInProgress: PropTypes.func,
    disabled: PropTypes.bool,
  }).isRequired,
};

export default OrderServiceRefreshButton;
