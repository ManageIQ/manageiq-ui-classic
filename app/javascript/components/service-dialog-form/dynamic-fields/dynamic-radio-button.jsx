import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS, getFieldValues, getRefreshEnabledFields } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptionsWithSort, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/**
 * DynamicRadioButton - A component to render a radio button group field with dynamic configuration options
 *
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 */
const DynamicRadioButton = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate unique ID for the radio button group
  const inputId = useMemo(() =>
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-group`,
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
    sortBy: fieldValues.sortBy || 'description',
    sortOrder: fieldValues.sortOrder || 'ascending',
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
   * Handles radio button selection change
   * @param {string} selectedValue - Selected radio button value
   */
  const handleSelectionChange = useCallback((selectedValue) => {
    handleFieldUpdate('change', { value: selectedValue });
  }, [handleFieldUpdate]);

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
   * Returns sorted items based on sortBy and sortOrder
   * @returns {Array} Sorted items array
   */
  const sortedItems = useMemo(() => {
    const { sortBy = 'description', sortOrder = 'ascending', items = [] } = fieldState;

    return [...items].sort((a, b) => {
      const valueA = a[sortBy] ? a[sortBy].toString() : '';
      const valueB = b[sortBy] ? b[sortBy].toString() : '';

      // Alphanumeric comparison using localeCompare
      return sortOrder === 'ascending'
        ? valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' })
        : valueB.localeCompare(valueA, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [fieldState.items, fieldState.sortBy, fieldState.sortOrder]);

  /**
   * Define radio button edit fields configuration based on whether it's dynamic or not
   */
  const radioButtonEditFields = useMemo(() => {
    const ordinaryOptions = [
      dynamicFields.readOnly,
      dynamicFields.visible,
      dynamicFields.required,
      dynamicFields.defaultDropdownValue,
      dynamicFields.valueType,
      dynamicFields.sortBy,
      dynamicFields.sortOrder,
      dynamicFields.entries,
      dynamicFields.fieldsToRefresh,
    ];

    const dynamicOptions = [
      dynamicFields.automateEntryPoint,
      dynamicFields.showRefresh,
      dynamicFields.loadOnInit,
      dynamicFields.required,
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
  }, [fieldState.dynamic]);

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <RadioButtonGroup
          legendText={fieldState.label || __('Radio Button group')}
          name={fieldState.name}
          onChange={handleSelectionChange}
          valueSelected={fieldState.value}
          disabled={fieldState.readOnly}
          aria-label={fieldState.label || __('Radio button field')}
        >
          {sortedItems.map((option) => (
            <RadioButton
              key={option.id}
              id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-${option.id}`}
              labelText={__(option.text)}
              value={option.id}
              disabled={fieldState.readOnly}
            />
          ))}
        </RadioButtonGroup>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={radioButtonEditFields}
        dynamicToggleAction={handleDynamicToggle}
      />
    </div>
  );
};

DynamicRadioButton.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicRadioButton;
