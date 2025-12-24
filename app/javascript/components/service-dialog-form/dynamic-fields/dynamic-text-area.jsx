import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TextArea } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS, getFieldValues, getRefreshEnabledFields } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/**
 * DynamicTextArea - A component to render a text area field with dynamic configuration options
 * 
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 * @returns {React.ReactElement} - Rendered component
 */
const DynamicTextArea = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate a unique ID for the input field
  const inputId = useMemo(() => (
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-area`
  ), [tabId, sectionId, fieldPosition]);
  
  // Get fields that have refresh enabled for the refresh dropdown 
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

  // Track input values separately from field state
  const [inputValues, setInputValues] = useState({});

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
   * Handles text area change
   * @param {Event} e - Change event
   */
  const handleTextAreaChange = useCallback((e) => {
    handleFieldUpdate(e, { value: e.target.value });
  }, [handleFieldUpdate]);

  // Define text area options and edit fields configuration
  const textAreaEditFields = useMemo(() => {
    const ordinaryOptions = [
      dynamicFields.defaultValue,
      dynamicFields.required,
      dynamicFields.readOnly,
      dynamicFields.visible,
      dynamicFields.validation,
      dynamicFields.validatorRule,
      dynamicFields.validatorMessage,
      dynamicFields.fieldsToRefresh,
    ];

    const dynamicOptions = [
      dynamicFields.automateEntryPoint,
      dynamicFields.showRefresh,
      dynamicFields.loadOnInit,
      dynamicFields.required,
      dynamicFields.validation,
      dynamicFields.validatorRule,
      dynamicFields.validatorMessage,
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
      tabs.push(overridableOptions());
    }
    
    return tabs;
  }, [fieldState.dynamic]);

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <TextArea
          id={inputId}
          name={fieldState.name}
          labelText={fieldState.label || __('Text Area')}
          placeholder={fieldState.placeholder || __('Enter text here')}
          required={fieldState.required}
          value={fieldState.value || ''}
          readOnly={fieldState.readOnly}
          onChange={handleTextAreaChange}
          invalid={fieldState.required && !fieldState.value}
          invalidText={fieldState.required && !fieldState.value ? __('This field is required') : ''}
          aria-label={fieldState.label || __('Text area field')}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={textAreaEditFields}
        dynamicToggleAction={handleDynamicToggle}
      />
    </div>
  );
};

DynamicTextArea.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextArea;
