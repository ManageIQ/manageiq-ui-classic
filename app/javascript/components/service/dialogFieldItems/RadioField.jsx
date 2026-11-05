import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton } from '@carbon/react';
import { fieldProperties, updateDialogField } from '../helper.field';
import FieldLabel from './FieldLabel';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the Radio buttons in the Service/DialogTabs/DialogGroups/DialogFields component */
const RadioField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const {
    fieldData, isDisabled, fieldId, requiredLabel,
  } = fieldProperties(field, data);

  /** Function to handle the RadioButton's onChange event. */
  const onChange = (selectedValue) => {
    if (data.isOrderServiceForm || data.isServiceReconfigure) {
      const { valid, value } = ServiceValidator.validateField({ value: selectedValue, field });
      updateDialogField(setData, field, { value, valid });
    }
  };

  return (
    <div className="field-radio-buttons">
      <RadioButtonGroup
        legendText={<FieldLabel field={field} />}
        name={field.name}
        id={fieldId}
        readOnly={field.read_only}
        invalid={!fieldData.valid}
        invalidText={requiredLabel}
        onChange={onChange}
        valueSelected={fieldData.value} // Ensure the selected value is correctly handled
      >
        {
          field.values && field.values.map((radio) => (
            <RadioButton
              key={`${fieldId}-${radio[0]}`}
              disabled={isDisabled}
              labelText={radio[1]}
              value={radio[0]}
              id={`${fieldId}-${radio[0]}`}
            />
          ))
        }
      </RadioButtonGroup>
      {!field.values && <div>{__('Radio button entries are not configured')}</div>}
      {field.required && !fieldData.valid && <div className="cds--form__helper-text">{requiredLabel}</div>}
    </div>
  );
};

RadioField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.arrayOf(PropTypes.shape({})),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default RadioField;
