import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'carbon-components-react';
import { fieldProperties } from '../helper.field';
import FieldLabel from './FieldLabel';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the Checkbox in the Service/DialogTabs/DialogGroups/DialogFields component */
const CheckboxField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const {
    fieldData, isDisabled, fieldId, requiredLabel,
  } = fieldProperties(field, data);

  /** Checkbox onChange event handler */
  const onChange = (checked) => {
    if (data.isOrderServiceForm) {
      const { valid, value } = ServiceValidator.validateField({ value: checked, field });
      data.dialogFields[field.name] = { ...data.dialogFields[field.name], value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  return (
    <div className="field-checkbox">
      <Checkbox
        disabled={isDisabled}
        id={fieldId}
        labelText={<FieldLabel field={field} />}
        onChange={(checked) => onChange(checked)}
        readOnly={field.read_only}
      />
      {
        !fieldData.valid && <div className="bx--form__helper-text">{requiredLabel}</div>
      }
    </div>
  );
};

CheckboxField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default CheckboxField;
