import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS, getFieldValues, getRefreshEnabledFields } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/**
 * DynamicCheckbox - A component to render a checkbox field with dynamic configuration options
 * 
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 */
const DynamicCheckbox = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate unique ID for the checkbox
  const inputId = useMemo(() => 
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-checkbox`, 
    [tabId, sectionId, fieldPosition]
  );

  // Get fields that have refresh enabled
  const refreshEnabledFields = useMemo(() => 
    getRefreshEnabledFields(fields),
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
   * Handles checkbox change event
   * @param {boolean} isChecked - New checkbox state
   */
  const handleCheckboxChange = useCallback((isChecked) => {
    handleFieldUpdate('change', { checked: isChecked });
  }, [handleFieldUpdate]);

  // Define checkbox options based on whether it's dynamic or not
  const checkboxEditFields = useMemo(() => {
    const ordinaryOptions = [
      dynamicFields.defaultCheckboxValue,
      dynamicFields.required,
      dynamicFields.readOnly,
      dynamicFields.visible,
      dynamicFields.fieldsToRefresh,
    ];

    const dynamicOptions = [
      dynamicFields.automateEntryPoint,
      dynamicFields.showRefresh,
      dynamicFields.loadOnInit,
      dynamicFields.required,
      dynamicFields.fieldsToRefresh,
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
      tabs.push(overridableOptions('checkBox'));
    }

    return tabs;
  }, [fieldState.dynamic]);

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <Checkbox
          id={inputId}
          name={fieldState.name}
          labelText={fieldState.label || __('Checkbox')}
          required={fieldState.required}
          checked={fieldState.checked}
          onChange={handleCheckboxChange}
          disabled={fieldState.readOnly}
          aria-label={fieldState.label || __('Checkbox field')}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={checkboxEditFields}
        dynamicToggleAction={handleDynamicToggle}
      />
    </div>
  );
};

DynamicCheckbox.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicCheckbox;
