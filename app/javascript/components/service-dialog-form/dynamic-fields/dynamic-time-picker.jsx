import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem, FormLabel,
} from 'carbon-components-react';
import {
  dynamicFieldDataProps, SD_ACTIONS, getCurrentDate, getCurrentTimeAndPeriod, getFieldValues, getRefreshEnabledFields,
} from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/**
 * DynamicTimePicker - A component to render a time picker field with dynamic configuration options
 * 
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 * @returns {React.ReactElement} - Rendered component
 */
const DynamicTimePicker = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate a unique ID for the input field
  const inputId = useMemo(() => (
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-date-time-picker`
  ), [tabId, sectionId, fieldPosition]);

  // Get fields that have refresh enabled for the refresh dropdown
  const refreshEnabledFields = useMemo(() => 
    getRefreshEnabledFields(fields),
    [fields]
  );

  // Initialize with default values
  const [date, setDate] = useState(() => getCurrentDate());
  const [time, setTime] = useState(() => getCurrentTimeAndPeriod().time);
  const [isValid, setIsValid] = useState(true);
  const [period, setPeriod] = useState(() => getCurrentTimeAndPeriod().period);

  // Initialize field state with values from the helper function
  const fieldValues = useMemo(() => getFieldValues(field), [field]);
  
  const [fieldState, setFieldState] = useState({
    ...fieldValues,
    position: fieldPosition,
    name: fieldValues.name || inputId,
    label: fieldValues.label || __('Timepicker'),
    fieldsToRefresh: refreshEnabledFields,
  });

  // Track input values separately from field state
  const [inputValues, setInputValues] = useState({});

  /**
   * Use useEffect to parse date and time from field value if available
   */
  useEffect(() => {
    if (fieldValues.value) {
      try {
        const dateObj = new Date(fieldValues.value);
        if (Number.isNaN(dateObj.getTime())) {
          console.error(__('Invalid date value:'), fieldValues.value);
        } else {
          // Format date as MM/DD/YYYY
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          });

          // Format time as HH:MM
          const hours = dateObj.getHours();
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          const newPeriod = hours >= 12 ? 'PM' : 'AM';
          const hour12 = (hours % 12 || 12).toString().padStart(2, '0'); // Convert 0 to 12 for 12-hour format
          const formattedTime = `${hour12}:${minutes}`;
          
          // Update state variables
          setDate(formattedDate);
          setTime(formattedTime);
          setPeriod(newPeriod);
          
          // Update field state
          setFieldState(prevState => ({
            ...prevState,
            date: formattedDate,
            time: formattedTime,
            period: newPeriod
          }));
        }
      } catch (e) {
        console.error(__('Error parsing date value:'), e);
      }
    }
  }, [fieldValues.value]);

  /**
   * Handles date change in the date picker
   * @param {Array} selectedDates - Array of selected dates
   */
  const handleDateChange = useCallback((selectedDates) => {
    if (selectedDates && selectedDates.length) {
      try {
        const formattedDate = new Intl.DateTimeFormat('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }).format(selectedDates[0]);
        
        setDate(formattedDate);
        setFieldState(prev => ({
          ...prev,
          value: `${formattedDate} ${time} ${period}`,
        }));
      } catch (error) {
        console.error(__('Error formatting date:'), error);
      }
    }
  }, [time, period]);

  /**
   * Function to validate the time input
   * @param {string} value - Time value to validate
   * @returns {boolean} - Whether the time is valid
   */
  const validateTime = useCallback((value) => {
    const timeRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]$/; // Matches 12-hour format hh:mm
    return timeRegex.test(value);
  }, []);

  /**
   * Handles time change in the time picker
   * @param {Event} event - Change event
   */
  const handleTimeChange = useCallback((event) => {
    const newTime = event.target.value;
    setTime(newTime);
    const isValidTime = validateTime(newTime);
    setIsValid(isValidTime);
    
    setFieldState(prev => ({
      ...prev,
      value: `${date} ${newTime} ${period}`,
    }));
  }, [date, period, validateTime]);

  /**
   * Handles period change (AM/PM)
   * @param {Event} event - Change event
   */
  const handlePeriodChange = useCallback((event) => {
    const newPeriod = event.target.value;
    setPeriod(newPeriod);
    
    setFieldState(prev => ({
      ...prev,
      value: `${date} ${time} ${newPeriod}`,
    }));
  }, [date, time]);

  /**
   * Updates field state and notifies parent component
   * @param {Event|string} event - Event object or action string
   * @param {Object} updatedFields - Fields to update
   */
  const handleFieldUpdate = useCallback((event, updatedFields) => {
    setFieldState((prevState) => {
      const newState = { ...prevState, ...updatedFields };
      
      // Notify parent component about the change
      onFieldAction({
        event,
        type: editActionType,
        fieldPosition,
        inputProps: newState
      });
      
      return newState;
    });
  }, [editActionType, fieldPosition, onFieldAction]);

  /**
   * Handles field actions like delete
   * @param {string} event - Action type
   * @param {Object} inputProps - Field properties
   */
  const handleFieldActions = useCallback((event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) 
      ? SD_ACTIONS.field.delete 
      : editActionType;

    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      ...inputProps,
    }));

    onFieldAction({
      event,
      fieldPosition,
      type,
      inputProps,
    });
  }, [editActionType, fieldPosition, onFieldAction]);

  /**
   * Updates field state when dynamic property changes
   * @param {boolean} isDynamic - Whether the field is dynamic
   */
  const handleDynamicToggle = useCallback((isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  }, []);

  /**
   * Updates the date/time value
   * @param {string} value - New date/time value
   */
  const updateDateTime = useCallback((value) => {
    setFieldState((prevState) => ({ ...prevState, value }));
  }, []);

  // Define time picker options and edit fields configuration
  const timePickerEditFields = useMemo(() => {
    const ordinaryOptions = [
      dynamicFields.required,
      dynamicFields.defaultDateTimePickerValue,
      dynamicFields.readOnly,
      dynamicFields.visible,
      dynamicFields.showPastDates,
      dynamicFields.fieldsToRefresh,
    ];

    const dynamicOptions = [
      dynamicFields.automateEntryPoint,
      dynamicFields.showRefresh,
      dynamicFields.showPastDates,
      dynamicFields.fieldsToRefresh,
      dynamicFields.required,
    ];

    const tabs = [
      fieldInformation(),
      {
        name: fieldTab.options,
        fields: fieldState.dynamic ? dynamicOptions : ordinaryOptions,
      },
      advanced(),
    ];
    
    if (fieldState.dynamic) {
      tabs.push(overridableOptions('timePicker'));
    }
    
    return tabs;
  }, [fieldState.dynamic]);

  // Calculate minDate based on showPastDates setting
  const minDate = useMemo(() => {
    if (fieldState.showPastDates) {
      return undefined; // Must be undefined, not empty string
    }
    try {
      return new Date().toLocaleDateString();
    } catch (error) {
      console.error(__('Error formatting date:'), error);
      return undefined;
    }
  }, [fieldState.showPastDates]);

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <FormLabel>{fieldState.label}</FormLabel>
        <DatePicker
          datePickerType="single"
          onChange={handleDateChange}
          minDate={minDate}
          disabled={fieldState.readOnly}
        >
          <DatePickerInput
            id={`${inputId}-date`}
            placeholder={__('mm/dd/yyyy')}
            value={date}
            labelText={__('Select Date')}
            hideLabel
            disabled={fieldState.readOnly}
            aria-label={__('Date input')}
          />
          <TimePicker
            id={`${inputId}-time`}
            labelText={__('Select Time')}
            hideLabel
            value={time}
            invalid={!isValid}
            invalidText={__('Enter a valid 12-hour time (e.g., 01:30)')}
            onChange={handleTimeChange}
            disabled={fieldState.readOnly}
            aria-label={__('Time input')}
          >
            <TimePickerSelect
              id={`${inputId}-period`}
              onChange={handlePeriodChange}
              labelText={__('Select Period')}
              value={period}
              disabled={fieldState.readOnly}
              aria-label={__('AM/PM selection')}
            >
              <SelectItem value="AM" text={__('AM')} />
              <SelectItem value="PM" text={__('PM')} />
            </TimePickerSelect>
          </TimePicker>
        </DatePicker>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={timePickerEditFields}
        dynamicToggleAction={handleDynamicToggle}
        onValueChange={updateDateTime}
      />
    </div>
  );
};

DynamicTimePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTimePicker;
