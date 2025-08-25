import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem, FormLabel,
} from 'carbon-components-react';
import {
  dynamicFieldDataProps, SD_ACTIONS, getCurrentDate, getCurrentTimeAndPeriod,
} from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTimePicker = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});
  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-date-time-picker`;
  const editActionType = SD_ACTIONS.field.edit;

  // // Helper function to get the formatted current date
  // const getCurrentDate = () => {
  //   const now = new Date();
  //   return now.toLocaleDateString('en-US', {
  //     month: '2-digit',
  //     day: '2-digit',
  //     year: 'numeric',
  //   });
  // };

  // // Helper function to get the current time and period
  // const getCurrentTimeAndPeriod = () => {
  //   const now = new Date();
  //   let hours = now.getHours();
  //   const minutes = now.getMinutes().toString().padStart(2, '0');
  //   const currentPeriod = hours >= 12 ? 'PM' : 'AM';
  //   hours = hours % 12 || 12; // Convert 0 hours to 12 in 12-hour format
  //   return { time: `${hours}:${minutes}`, period: currentPeriod };
  // };

  const [date, setDate] = useState(getCurrentDate);
  const [time, setTime] = useState(() => getCurrentTimeAndPeriod().time);
  const [isValid, setIsValid] = useState(true);
  const [period, setPeriod] = useState(() => getCurrentTimeAndPeriod().period);

  // const [date, setDate] = React.useState('');
  // const [time, setTime] = React.useState('');
  // const [isValid, setIsValid] = useState(true);
  // const [period, setPeriod] = useState('AM');

  const combinedDateTime = () => {
    const dateTime = `${date} ${time} ${period}`;
    // return new Date(dateTime).toISOString();
    return dateTime;
  };

  const refreshEnabledFields = section.fields
    .filter((field) => field.showRefresh)
    .map((field) => ({ value: field.label, label: field.label }));

  const [fieldState, setFieldState] = useState({
    type: 'DialogFieldDateTimeControl',
    position: fieldPosition,
    label: __('Timepicker'),
    name: inputId,
    visible: true,
    // value: field.defaultDatePickerValue || '',
    value: '',
    fieldsToRefresh: refreshEnabledFields,
    date,
    time,
    period,
  });

  const handleDateChange = (selectedDates) => {
    if (selectedDates.length > 0) {
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      }).format(selectedDates[0]);
      setDate(formattedDate);
      setFieldState((prevState) => ({ ...prevState, value: combinedDateTime() }));
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
    setFieldState((prevState) => ({ ...prevState, value: combinedDateTime() }));
  };

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
    setFieldState((prevState) => ({ ...prevState, value: combinedDateTime() }));
  };

  const handleFieldUpdate = (event, updatedFields) => {
    // date = updatedFields.value[0].toLocaleDateString('en-US');
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    onFieldAction({ event, type: editActionType, fieldPosition, inputProps: { ...fieldState, ...updatedFields } });
  };

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : editActionType;

    setInputValues({
      ...inputValues,
      ...inputProps,
    });

    onFieldAction({
      event,
      fieldPosition,
      type,
      inputProps,
    });
  };

  // To reset tabs in Edit Modal based on 'dynamic' switch
  const resetEditModalTabs = (isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  };

  const updateDateTime = (value) => {
    setFieldState((prevState) => ({ ...prevState, value }));
  };

  const ordinaryTimePickerOptions = () => ([
    dynamicFields.required,
    dynamicFields.defaultDateTimePickerValue,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.showPastDates,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTimePickerOptions = () => ([
    dynamicFields.automateEntryPoint,
    dynamicFields.showRefresh,
    dynamicFields.showPastDates,
    dynamicFields.fieldsToRefresh,
    dynamicFields.required,
  ]);

  const timePickerOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicTimePickerOptions() : ordinaryTimePickerOptions(),
  });

  const timePickerEditFields = () => {
    const tabs = [
      fieldInformation(),
      timePickerOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
      tabs.push(overridableOptions('timePicker'));
    }
    return tabs;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <FormLabel>{fieldState.label}</FormLabel>
        <DatePicker
          datePickerType="single"
          onChange={handleDateChange}
          minDate={fieldState.showPastDates ? undefined : new Date().toLocaleDateString()}
        >
          <DatePickerInput
            id="date-picker-single"
            placeholder="mm/dd/yyyy"
            value={date}
            labelText={__('Select Date')}
            hideLabel
          />
          <TimePicker
            id="time-picker"
            labelText={__('Select Time')}
            hideLabel
            value={time}
            invalid={!isValid}
            invalidText="Enter a valid 12-hour time (e.g., 01:30)"
            onChange={handleTimeChange}
          >
            <TimePickerSelect
              id="time-picker-select-1"
              onChange={handlePeriodChange}
              labelText={__('Select Period')}
            >
              <SelectItem value="AM" text="AM" />
              <SelectItem value="PM" text="PM" />
            </TimePickerSelect>
          </TimePicker>
        </DatePicker>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={timePickerEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
        onValueChange={(value) => updateDateTime(value)}
      />
    </div>
  );
};

DynamicTimePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTimePicker;
