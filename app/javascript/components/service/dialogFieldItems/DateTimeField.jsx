import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Dropdown, DatePickerInput } from 'carbon-components-react';
import {
  requiredLabel, fieldComponentId, currentDateTime, dateTimeString, extractDateTime,
} from '../helper';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the Radio buttons in the Service/DialogTabs/DialogGroups/DialogFields component */
const DateTimeField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const fieldData = data.dialogFields[field.name];
  const selectedDateTime = dateTimeString(fieldData.value);

  const { hours, minutes } = currentDateTime();

  const onHourChange = ({ selectedItem }) => {
    if (data.isOrderServiceForm) {
      fieldData.value.hour = selectedItem.id;
      data.dialogFields[field.name] = { ...fieldData };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  const onMinuteChange = ({ selectedItem }) => {
    if (data.isOrderServiceForm) {
      fieldData.value.minute = selectedItem.id;
      data.dialogFields[field.name] = { ...fieldData };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  const onDateChange = (selectedItem) => {
    if (data.isOrderServiceForm) {
      const extractedDateTime = extractDateTime(selectedItem[0], selectedDateTime);
      const { valid, value } = ServiceValidator.validateField({ field, value: extractedDateTime, isOrderServiceForm: data.isOrderServiceForm });
      data.dialogFields[field.name] = { value, valid };
      setData({
        ...data,
        dialogFields: { ...data.dialogFields },
        fieldsToRefresh: field.dialog_field_responders,
      });
    }
  };

  return (
    <div className="time-picker-container">
      <DatePicker datePickerType="single" value={selectedDateTime.date} onChange={onDateChange}>
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
      <Dropdown
        className="time-picker"
        disabled={!!data.fieldsToRefresh.length > 0}
        id={`hours-${fieldComponentId(field)}`}
        titleText="Hours"
        initialSelectedItem={selectedDateTime.hour}
        // selectedItem={fieldData.value}
        label={__('Hrs')}
        items={hours}
        itemToString={(item) => (item ? item.text : '')}
        onChange={onHourChange}
        readOnly={field.read_only}
      />
      <Dropdown
        className="time-picker"
        disabled={!!data.fieldsToRefresh.length > 0}
        id={`minutes-${fieldComponentId(field)}`}
        titleText="Minutes"
        initialSelectedItem={selectedDateTime.minute}
        // selectedItem={fieldData.value}
        label={__('Min')}
        items={minutes}
        itemToString={(item) => (item ? item.text : '')}
        onChange={onMinuteChange}
        readOnly={field.read_only}
      />
    </div>
  );
};

DateTimeField.propTypes = {
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

export default DateTimeField;
