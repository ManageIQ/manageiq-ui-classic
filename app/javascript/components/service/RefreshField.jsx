import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, Loading } from 'carbon-components-react';
import { Renew16 } from '@carbon/icons-react';
import ServiceContext from './ServiceContext';
import ServiceValidator from './ServiceValidator';
import { defaultFieldValue } from './helper';

/** Function to reset the dialogField data when the field refresh button is clicked. */
const resetDialogField = (dialogFields, field) => {
  const { value, valid } = ServiceValidator.validateField({ field, value: defaultFieldValue(field) });
  dialogFields[field.name] = { value, valid };
  return { ...dialogFields };
};

const RefreshField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const { fieldsToRefresh } = data;
  const inProgress = fieldsToRefresh.includes(field.name);
  return (
    <div className="refresh-field-item">
      {
        !!(field.dynamic && field.show_refresh_button) && !inProgress && (
          <Button
            hasIconOnly
            disabled={!data.isOrderServiceForm || !!data.fieldsToRefresh.length > 0}
            className="refresh-field-button"
            onClick={() => {
              setData({
                ...data,
                fieldsToRefresh: [field.name],
                dialogFields: resetDialogField(data.dialogFields, field),
              });
            }}
            iconDescription={__(`Refresh ${field.label}`)}
            tooltipAlignment="start"
            tooltipPosition="left"
            renderIcon={Renew16}
          />
        )
      }
      {
        inProgress && <Loading active small withOverlay={false} className="loading" />
      }
    </div>
  );
};

RefreshField.propTypes = {
  field: PropTypes.shape({
    label: PropTypes.string,
    dynamic: PropTypes.bool,
    show_refresh_button: PropTypes.bool,
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    name: PropTypes.string,
  }).isRequired,
};

export default RefreshField;
