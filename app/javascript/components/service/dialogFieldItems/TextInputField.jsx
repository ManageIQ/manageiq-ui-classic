import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { TextInput, PasswordInput } from 'carbon-components-react';
import FieldLabel from './FieldLabel';
import { fieldProperties } from '../helper.field';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the TextInputField in the Service/DialogTabs/DialogGroups/DialogFields component */
const TextInputField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const {
    fieldData, isDisabled, fieldId, requiredLabel,
  } = fieldProperties(field, data);

  /** Function to handle the TextInput and PasswordInput onChange event. */
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

  /** Function to return the common props needed for TextInput and PasswordInput component. */
  const getCommonProps = () => ({
    disabled: isDisabled,
    invalid: !fieldData.valid,
    value: fieldData.value && Number.isInteger(fieldData.value) ? `${fieldData.value}` : fieldData.value,
    readOnly: field.read_only,
    invalidText: requiredLabel,
    id: fieldId,
    onChange: (event) => onChange(event),
    labelText: <FieldLabel field={field} />,
  });

  /** Function to render the PassportInput Component */
  const passwordInput = () => (<PasswordInput {...getCommonProps()} type="password" />);

  /** Function to render the TextInput Component */
  const textInput = () => (<TextInput {...getCommonProps()} type={field.data_type === 'integer' ? 'number' : 'text'} />);

  return field.options && field.options.protected ? passwordInput() : textInput();
};

TextInputField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    default_value: PropTypes.string,
    data_type: PropTypes.string,
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
    options: PropTypes.shape({
      protected: PropTypes.bool,
    }),
  }).isRequired,
};

export default TextInputField;
