import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput, TextInput } from '@carbon/react';
import { isoToDatePickerValue, extractTimeFromDateTime } from '../helper';

// DialogFieldDateTimeControl: date picker + time input combined.
// default_value is stored as 'YYYY-MM-DD HH:MM'; both portions are read from the saved value.
const DynamicTimePicker = ({ field }) => {
  const timeStr = extractTimeFromDateTime(field.default_value);

  return (
    <div className="dynamic-time-picker">
      <DatePicker
        datePickerType="single"
        value={isoToDatePickerValue(field.default_value)}
        readOnly={field.read_only}
        onChange={() => {}} // display-only in the editor canvas
      >
        <DatePickerInput
          id={`field-${field.name}-date`}
          labelText={field.label}
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
      <TextInput
        id={`field-${field.name}-time`}
        labelText={__('Time')}
        value={timeStr}
        placeholder="HH:MM"
        readOnly
        onChange={() => {}}
      />
    </div>
  );
};

DynamicTimePicker.propTypes = {
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    default_value: PropTypes.string,
    read_only: PropTypes.bool,
  }).isRequired,
};

export default DynamicTimePicker;
