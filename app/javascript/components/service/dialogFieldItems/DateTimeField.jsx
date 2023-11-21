import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Dropdown, DatePickerInput } from 'carbon-components-react';
import { fieldProperties } from '../helper.field';
import { currentDateTime, dateTimeString, extractDateTime } from '../helper.dateTime';
import ServiceContext from '../ServiceContext';
import ServiceValidator from '../ServiceValidator';

/** Component to render the Radio buttons in the Service/DialogTabs/DialogGroups/DialogFields component */
const DateTimeField = ({ field }) => {
  const { data, setData } = useContext(ServiceContext);
  const {
    fieldData, isDisabled, fieldId, requiredLabel,
  } = fieldProperties(field, data);
  const selectedDateTime = dateTimeString(fieldData.value);
  const { hours, minutes } = currentDateTime();

  const updateDateTime = (fieldData) => {
    data.dialogFields[field.name] = { ...data.dialogFields[field.name], ...fieldData };
    setData({
      ...data,
      dialogFields: { ...data.dialogFields },
      fieldsToRefresh: field.dialog_field_responders,
    });
  };

  /** Function to handle the hour's onChange event. */
  const onHourChange = ({ selectedItem }) => {
    if (data.isOrderServiceForm) {
      fieldData.value.hour = selectedItem.id;
      updateDateTime({ ...fieldData });
    }
  };

  /** Function to handle the minute's onChange event. */
  const onMinuteChange = ({ selectedItem }) => {
    if (data.isOrderServiceForm) {
      fieldData.value.minute = selectedItem.id;
      updateDateTime({ ...fieldData });
    }
  };

  /** Function to handle the AM/PM onChange event. */
  const onMeridiemChange = ({ selectedItem }) => {
    if (data.isOrderServiceForm) {
      fieldData.value.meridiem = selectedItem.id;
      updateDateTime({ ...fieldData });
    }
  };

  /** Function to handle the date's onChange event. */
  const onDateChange = (selectedItem) => {
    if (data.isOrderServiceForm) {
      const extractedDateTime = extractDateTime(selectedItem[0], selectedDateTime);
      const { valid, value } = ServiceValidator.validateField({ field, value: extractedDateTime });
      updateDateTime({ value, valid, type: field.type });
    }
  };

  return (
    <div className="time-picker-container">
      <DatePicker
        datePickerType="single"
        value={selectedDateTime.date}
        onChange={onDateChange}
        disabled={isDisabled}
      >
        <DatePickerInput
          placeholder="mm/dd/yyyy"
          labelText={field.label}
          id={fieldId}
          size="md"
          readOnly={field.read_only}
          invalid={!fieldData.valid}
          invalidText={requiredLabel}
          disabled={isDisabled}
        />
      </DatePicker>
      <Dropdown
        className="time-picker"
        disabled={isDisabled}
        id={`hours-${fieldId}`}
        titleText={__('Hours')}
        initialSelectedItem={selectedDateTime.hour}
        label={__('Hrs')}
        items={hours}
        itemToString={(item) => (item ? item.text : '')}
        onChange={onHourChange}
        readOnly={field.read_only}
      />
      <Dropdown
        className="time-picker"
        disabled={isDisabled}
        id={`minutes-${fieldId}`}
        titleText={__('Minutes')}
        initialSelectedItem={{ ...selectedDateTime.minute }}
        label={__('Min')}
        items={minutes}
        itemToString={(item) => (item ? item.text : '')}
        onChange={onMinuteChange}
        readOnly={field.read_only}
      />
      <Dropdown
        className="time-picker"
        disabled={isDisabled}
        id={`meridiem-${fieldId}`}
        titleText={__('Meridiem')}
        initialSelectedItem={selectedDateTime.meridiem}
        label={__('meridiem')}
        items={['AM', 'PM'].map((item) => ({ id: item, text: item }))}
        itemToString={(item) => (item ? item.text : '')}
        onChange={onMeridiemChange}
        readOnly={field.read_only}
      />
    </div>
  );
};

DateTimeField.propTypes = {
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

export default DateTimeField;
