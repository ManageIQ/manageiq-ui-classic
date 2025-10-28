import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, DatePickerInput } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS, getFieldValues } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/**
 * DynamicDatePicker - A component to render a date picker field with dynamic configuration options
 * 
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 * @returns {React.ReactElement} - Rendered component
 */
const DynamicDatePicker = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate a unique ID for the input field
  const inputId = useMemo(() => (
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-date-picker`
  ), [tabId, sectionId, fieldPosition]);
  
  // Get fields that have refresh enabled for the refresh dropdown
  const refreshEnabledFields = useMemo(() => 
    fields.reduce((result, fieldItem) => {
      if (fieldItem.showRefresh) {
        result.push({ value: fieldItem.label, label: fieldItem.label });
      }
      return result;
    }, []),
    [fields]
  );

  // Initialize field state with values from the helper function
  const fieldValues = useMemo(() => getFieldValues(field), [field]);
  
  const [fieldState, setFieldState] = useState({
    ...fieldValues,
    position: fieldPosition,
    name: fieldValues.name || inputId,
    fieldsToRefresh: refreshEnabledFields,
  });

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
   * Handles date picker value changes
   * @param {Array} selectedDates - Array of selected dates
   * @param {string} dateStr - Date string representation
   */
  const handleDateChange = useCallback((_selectedDates, dateStr) => {
    handleFieldUpdate('change', { value: dateStr });
  }, [handleFieldUpdate]);

  // Define date picker options and edit fields configuration
  const datePickerEditFields = useMemo(() => {
    const ordinaryOptions = [
      dynamicFields.required,
      dynamicFields.defaultDatePickerValue,
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
      tabs.push(overridableOptions('datePicker'));
    }
    
    return tabs;
  }, [fieldState.dynamic]);

  // Calculate minDate based on showPastDates setting
  const minDate = useMemo(() => {
    if (fieldState.showPastDates) {
      return undefined;
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
        <DatePicker
          datePickerType="single"
          dateFormat="m/d/Y"
          minDate={minDate}
          onChange={handleDateChange}
          disabled={fieldState.readOnly}
        >
          <DatePickerInput
            datePickerType="single"
            id={inputId}
            labelText={fieldState.label || __('Date')}
            value={fieldState.value || ''}
            placeholder={__('mm/dd/yyyy')}
            disabled={fieldState.readOnly}
            invalid={fieldState.required && !fieldState.value}
            invalidText={fieldState.required && !fieldState.value ? __('This field is required') : ''}
            aria-label={fieldState.label || __('Date picker field')}
          />
        </DatePicker>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={datePickerEditFields}
        dynamicToggleAction={handleDynamicToggle}
      />
    </div>
  );
};

DynamicDatePicker.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDatePicker;
