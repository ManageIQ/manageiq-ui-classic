import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput } from 'carbon-components-react';
import {
  requiredLabel, fieldComponentId, extractDate, dateString,
} from '../helper';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the Radio buttons in the Service/DialogTabs/DialogGroups/DialogFields component */
const DateField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const fieldData = data.dialogFields[field.name];
  const selectedDate = dateString(fieldData.value);

  const onChange = (selectedItem) => {
    if (data.isOrderServiceForm) {
      const extractedDate = extractDate(selectedItem[0]);
      const { valid, value } = ServiceValidator.validateField({ field, value: extractedDate, isOrderServiceForm: data.isOrderServiceForm });
      data.dialogFields[field.name] = { value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  return (
    <div className="field-date">
      <DatePicker datePickerType="single" value={selectedDate} onChange={onChange}>
        <DatePickerInput
          placeholder="mm/dd/yyyy"
          labelText={field.label}
          id={fieldComponentId(field)}
          size="md"
          readOnly={field.read_only}
          invalid={!fieldData.valid}
          invalidText={requiredLabel(field.required)}
        />
      </DatePicker>
    </div>
  );
};

DateField.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string,
    default_value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
    values: PropTypes.arrayOf(PropTypes.any),
    label: PropTypes.string,
    name: PropTypes.string,
    required: PropTypes.bool,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default DateField;
