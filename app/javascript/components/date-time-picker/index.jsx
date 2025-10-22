import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker,
  DatePickerInput,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  FormLabel,
} from 'carbon-components-react';
import { getCurrentDate, getCurrentTimeAndPeriod } from '../service-dialog-form/helper';

const CustomDateTimePicker = ({ label, onChange, initialData }) => {
  const [date, setDate] = useState(() => initialData.date || getCurrentDate());
  const [time, setTime] = useState(() => initialData.time || getCurrentTimeAndPeriod().time);
  const [isValid, setIsValid] = useState(true);
  const [period, setPeriod] = useState(() => initialData.period || getCurrentTimeAndPeriod().period);

  const handleDateChange = (newDate) => {
    if (newDate && newDate.length) {
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(newDate[0]);
      setDate(formattedDate);
      onChange({ value: `${formattedDate} ${time} ${period}`, initialData });
    }
  };

  // Function to validate the time input
  const validateTime = (value) => {
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/; // Matches 12-hour format hh:mm
    return timeRegex.test(value);
  };

  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    setTime(newTime);
    const isValidTime = validateTime(newTime);
    setIsValid(isValidTime)
    if (isValidTime) onChange({ value: `${date} ${newTime} ${period}`, initialData });
  };

  const handlePeriodChange = (event) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    onChange({ value: `${date} ${time} ${newPeriod}`, initialData });
  };

  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <DatePicker
        datePickerType="single"
        onChange={handleDateChange}
      >
        <DatePickerInput
          id="date-picker-single"
          placeholder="mm/dd/yyyy"
          labelText={__('Select Date')}
          value={date}
          hideLabel
          onChange={handleDateChange}
        />
        <TimePicker
          id="time-picker"
          placeholder="hh:mm"
          labelText={__('Select Time')}
          invalid={!isValid}
          invalidText="Enter a valid 12-hour time (e.g., 01:30)"
          hideLabel
          value={time}
          onChange={handleTimeChange}
        >
          <TimePickerSelect
            id="time-picker-select-1"
            labelText={__('Select Period')}
            defaultValue={period}
            onChange={handlePeriodChange}
          >
            <SelectItem value="AM" text="AM" />
            <SelectItem value="PM" text="PM" />
          </TimePickerSelect>
        </TimePicker>
      </DatePicker>
    </div>
  );
};

CustomDateTimePicker.propTypes = {
  initialData: PropTypes.shape({
    date: PropTypes.string,
    time: PropTypes.string,
    period: PropTypes.string,
  }),
  onChange: PropTypes.func,
  label: PropTypes.string,
};

CustomDateTimePicker.defaultProps = {
  initialData: { date: '', time: '', period: '' },
  onChange: () => {},
  label: '',
};

export default CustomDateTimePicker;
