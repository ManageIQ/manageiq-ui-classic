import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { fieldProperties } from '../helper.field';
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
    if (data.isOrderServiceForm) {
      const { valid, value } = ServiceValidator.validateField({ value: selectedValue, field });
      data.dialogFields[field.name] = { ...data.dialogFields[field.name], value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
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
              key={`radio-${radio[1]}`}
              disabled={isDisabled}
              labelText={radio[1]}
              value={radio[0]}
              id={`radio-${radio[1]}`}
            />
          ))
        }
      </RadioButtonGroup>
      {!field.values && <div>{__('Radio button entries are not configured')}</div>}
      {field.required && !fieldData.valid && <div className="bx--form__helper-text">{requiredLabel}</div>}
    </div>
  );
};

RadioField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.arrayOf(PropTypes.any),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default RadioField;
