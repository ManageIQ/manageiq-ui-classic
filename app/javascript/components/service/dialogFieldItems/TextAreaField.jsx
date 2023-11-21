import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { TextArea } from 'carbon-components-react';
import { fieldProperties } from '../helper.field';
import FieldLabel from './FieldLabel';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the TextAreaField in the Service/DialogTabs/DialogGroups/DialogFields component */
const TextAreaField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const {
    fieldData, isDisabled, fieldId, requiredLabel,
  } = fieldProperties(field, data);

  /** Function to handle the TextArea's onChange event. */
  const onChange = (event) => {
    if (data.isOrderServiceForm) {
      const { valid, value, message } = ServiceValidator.validateField({ value: event.target.value, field });
      data.dialogFields[field.name] = { ...data.dialogFields[field.name], value, valid, message };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  return (
    <TextArea
      disabled={isDisabled}
      invalid={!fieldData.valid}
      value={fieldData.value}
      readOnly={field.read_only}
      invalidText={requiredLabel}
      rows={4}
      id={fieldId}
      onChange={(event) => onChange(event)}
      labelText={<FieldLabel field={field} />}
    />
  );
};

TextAreaField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    default_value: PropTypes.string,
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default TextAreaField;
