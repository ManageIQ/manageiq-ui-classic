import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem } from '@carbon/react';
import { getCurrentTimeAndPeriod } from '../helper';

// DialogFieldDateTimeControl: date picker + time picker combined.
// default_value is stored as a date string; time defaults to current time on render.
const DynamicTimePicker = ({ field }) => {
  const { hour, minute, period } = getCurrentTimeAndPeriod();

  return (
    <div className="dynamic-time-picker">
      <DatePicker
        datePickerType="single"
        value={field.default_value || ''}
        readOnly={field.read_only}
        onChange={() => {}} // display-only in the editor canvas
      >
        <DatePickerInput
          id={`field-${field.name}-date`}
          labelText={field.label}
          placeholder="mm/dd/yyyy"
        />
      </DatePicker>
      <TimePicker
        id={`field-${field.name}-time`}
        labelText={__('Time')}
        value={`${hour}:${minute}`}
        readOnly={field.read_only}
        onChange={() => {}} // display-only in the editor canvas
      >
        <TimePickerSelect
          id={`field-${field.name}-period`}
          labelText={__('AM/PM')}
          value={period}
          onChange={() => {}}
        >
          <SelectItem value="AM" text="AM" />
          <SelectItem value="PM" text="PM" />
        </TimePickerSelect>
      </TimePicker>
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
