import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { MultiSelect } from 'carbon-components-react';
import {
  dynamicFieldDataProps,
  SD_ACTIONS,
  getFieldValues,
  getRefreshEnabledFields,
  sortItems,
} from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptionsWithSort, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/**
 * DynamicDropdown - A component to render a dropdown/multiselect field with dynamic configuration options
 *
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 */
const DynamicDropdown = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate unique ID for the dropdown
  const inputId = useMemo(() =>
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-dropdown`,
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
    automationType: 'embedded_automate',
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
   * Updates the automation type (embedded_automate or embedded_workflow)
   * @param {string} value - New automation type
   */
  const handleAutomationTypeChange = useCallback((value) => {
    setFieldState((prevState) => ({ ...prevState, automationType: value }));
  }, []);

  /**
   * Handles dropdown selection change
   * @param {Object} params - Selection parameters
   * @param {Array} params.selectedItems - Selected items
   */
  const handleSelectionChange = useCallback(({ selectedItems }) => {
    const items = selectedItems.map((item) => item.value);
    handleFieldUpdate('change', { value: items });
  }, [handleFieldUpdate]);

  /**
   * Validates if the current selection is invalid
   * @returns {boolean} True if selection is invalid
   */
  const isSelectionInvalid = useMemo(() => {
    // If single-select mode, only one item should be selected
    if (!fieldState.multiselect) {
      return fieldState.value && fieldState.value.length > 1;
    }
    return false;
  }, [fieldState.multiselect, fieldState.value]);

  /**
   * Returns sorted items based on sortBy and sortOrder
   * @returns {Array} Sorted items array
   */
  const sortedItems = useMemo(() =>
    sortItems(fieldState.items, fieldState.sortBy, fieldState.sortOrder),
    [fieldState.items, fieldState.sortBy, fieldState.sortOrder]
  );

  /**
   * Define dropdown edit fields configuration based on whether it's dynamic or not
   */
  const dropdownEditFields = useMemo(() => {
    const ordinaryOptions = [
      dynamicFields.readOnly,
      dynamicFields.visible,
      dynamicFields.required,
      dynamicFields.multiselect,
      dynamicFields.defaultDropdownValue,
      dynamicFields.valueType,
      dynamicFields.sortBy,
      dynamicFields.sortOrder,
      dynamicFields.entries,
      dynamicFields.fieldsToRefresh,
    ];

    const currentAutomationType = fieldState.automationType || 'embedded_automate';
    const dynamicOptions = [
      dynamicFields.automationType,
      currentAutomationType === 'embedded_workflow'
        ? dynamicFields.workflowEntryPoint
        : dynamicFields.automateEntryPoint,
      dynamicFields.showRefresh,
      dynamicFields.loadOnInit,
      dynamicFields.required,
      dynamicFields.multiselect,
      dynamicFields.valueType,
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
      tabs.push(overridableOptionsWithSort());
    }

    return tabs;
  }, [fieldState.dynamic, fieldState.automationType]);

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <MultiSelect
          id={inputId}
          name={fieldState.name}
          label={fieldState.label}
          helperText={__('This is helper text')}
          items={sortedItems}
          sortItems={(items) => items}
          itemToString={(item) => (item ? item.description : '')}
          selectionFeedback="top-after-reopen"
          invalid={isSelectionInvalid}
          invalidText={__('Please select only one item.')}
          onChange={handleSelectionChange}
          disabled={fieldState.readOnly}
          aria-label={fieldState.label || __('Dropdown field')}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={dropdownEditFields}
        dynamicToggleAction={handleDynamicToggle}
        onValueChange={handleAutomationTypeChange}
      />
    </div>
  );
};

DynamicDropdown.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDropdown;
