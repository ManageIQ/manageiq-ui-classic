import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { TextInput, PasswordInput } from 'carbon-components-react';
import FieldLabel from './FieldLabel';
import { requiredLabel, fieldComponentId } from '../helper';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the TextInputField in the Service/DialogTabs/DialogGroups/DialogFields component */
const TextInputField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const fieldId = fieldComponentId(field);
  const fieldData = data.dialogFields[field.name];

  const onChange = (event) => {
    if (data.isOrderServiceForm) {
      const { valid, value } = ServiceValidator.validateField({ value: event.target.value, field, isOrderServiceForm: data.isOrderServiceForm });
      data.dialogFields[field.name] = { value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  const getCommonProps = (field, fieldData, data, fieldId, onChange) => ({
    disabled: !data.isOrderServiceForm || !!data.fieldsToRefresh.length > 0,
    invalid: !fieldData.valid,
    value: fieldData.value,
    readOnly: field.read_only,
    invalidText: requiredLabel(field.required),
    id: fieldId,
    onChange: (event) => onChange(event),
    labelText: <FieldLabel field={field} />,
  });

  const passwordInput = () => (
    <PasswordInput
      {...getCommonProps(field, fieldData, data, fieldId, onChange)}
      type="password"
    />
  );

  const textInput = () => (
    <TextInput
      {...getCommonProps(field, fieldData, data, fieldId, onChange)}
      type="text"
    />
  );

  return field.options && field.options.protected ? passwordInput() : textInput();
};

TextInputField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    default_value: PropTypes.string,
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
