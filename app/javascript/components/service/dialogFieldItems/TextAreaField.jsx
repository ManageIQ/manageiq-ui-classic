import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { TextArea } from 'carbon-components-react';
import { requiredLabel, fieldComponentId } from '../helper';
import FieldLabel from './FieldLabel';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the TextAreaField in the Service/DialogTabs/DialogGroups/DialogFields component */
const TextAreaField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
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

  return (
    <TextArea
      disabled={!data.isOrderServiceForm || !!data.fieldsToRefresh.length > 0}
      invalid={!fieldData.valid}
      value={fieldData.value}
      readOnly={field.read_only}
      invalidText={requiredLabel(field.required)}
      rows={4}
      id={fieldComponentId(field)}
      onChange={(event) => onChange(event)}
      labelText={<FieldLabel field={field} />}
    />
  );
};

TextAreaField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    default_value: PropTypes.string,
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default TextAreaField;
