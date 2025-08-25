import React, { useState } from 'react';
import {
  DatePicker,
  DatePickerInput,
  TimePicker,
  TimePickerSelect,
  SelectItem,
  FormLabel,
} from 'carbon-components-react';
import { getCurrentDate, getCurrentTimeAndPeriod } from '../service-dialog-form/helper';

const CustomDateTimePicker = (field) => {
  const { initialData, onChange } = field;

  const [date, setDate] = useState(initialData.date || getCurrentDate);
  const [time, setTime] = useState(() => initialData.time || getCurrentTimeAndPeriod().time);
  const [isValid, setIsValid] = useState(true);
  const [period, setPeriod] = useState(() => initialData.period || getCurrentTimeAndPeriod().period);

  const combinedDateTime = () => {
    const dateTime = `${date} ${time} ${period}`;
    // return new Date(dateTime).toISOString();
    return dateTime;
  };

  const handleDateChange = (newDate) => {
    if (newDate.length > 0) {
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(newDate[0]);
      setDate(formattedDate);
      // onChange({ date: newDate, time, period }); // Call the onChange function passed as prop, passing the updated values
      onChange({ value: combinedDateTime(), initialData });
    }
  };

  // Function to validate the time input
  const validateTime = (value) => {
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/; // Matches 12-hour format hh:mm
    setIsValid(timeRegex.test(value));
  };

  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    setTime(newTime);
    validateTime(newTime);
    if (isValid) onChange({ value: combinedDateTime(), initialData });
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    onChange({ value: combinedDateTime(), initialData });
  };

  

  return (
    <div>
      <FormLabel>{field.label}</FormLabel>
      <DatePicker
        datePickerType="single"
        onChange={handleDateChange}
      >
        <DatePickerInput
          id="date-picker-single"
          placeholder="mm/dd/yyyy"
          labelText={__('Select Date')}
          // value={initialData.date}
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
          // value={initialData.time}
          onChange={handleTimeChange}
        >
          <TimePickerSelect
            id="time-picker-select-1"
            labelText={__('Select Period')}
            defaultValue={period}
            // defaultValue={initialData.period}
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

export default CustomDateTimePicker;
