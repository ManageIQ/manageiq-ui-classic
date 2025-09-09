import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MultiSelect } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import { defaultDropdownOptions } from '../edit-field-modal/fields.schema';
import {
  fieldInformation, advanced, overridableOptionsWithSort, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicDropdown = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-dropdown`;
  const editActionType = SD_ACTIONS.field.edit;

  const refreshEnabledFields = section.fields
    .filter((field) => field.showRefresh)
    .map((field) => ({ value: field.label, label: field.label }));

  // Initialize field state with values from the field prop or defaults
  const [fieldState, setFieldState] = useState({
    type: field.type || 'DialogFieldDropDownList',
    position: fieldPosition,
    label: field.label || __('Selection Dropdown'),
    required: field.required || false,
    name: field.name || inputId,
    visible: field.visible !== undefined ? field.visible : true,
    items: field.values ? field.values.map(([value, description]) => ({ value, description })) : defaultDropdownOptions,
    multiselect: field.force_multi_value || false,
    value: field.default_value || field.value || [],
    readOnly: field.read_only || false,
    dynamic: field.dynamic || false,
    fieldsToRefresh: refreshEnabledFields,
    sortBy: (field.options && field.options.sort_by) || 'description',
    sortOrder: (field.options && field.options.sort_order) || 'ascending',
    automationType: 'embedded_automate',
  });

  // Log the field data for debugging
  console.log('Field data in DynamicDropdown:', field);
  console.log('Field state initialized as:', fieldState);

  const handleFieldUpdate = (event, updatedFields) => {
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    onFieldAction({
      event, type: editActionType, fieldPosition, inputProps: { ...fieldState, ...updatedFields }
    });
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

  const updateAutomationType = (value) => {
    setFieldState((prevState) => ({ ...prevState, automationType: value }));
  };

  const ordinaryDropdownOptions = () => ([
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
  ]);

  const dynamicDropdownOptions = () => {
    const currentAutomationType = fieldState.automationType || 'embedded_automate';
    return [
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
  };

  const DropdownOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicDropdownOptions() : ordinaryDropdownOptions(),
  });

  const DropdownEditFields = () => {
    const tabs = [
      fieldInformation(),
      DropdownOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
      tabs.push(overridableOptionsWithSort());
    }
    return tabs;
  };

  const isSelectionInvalid = () => {
    // If single-select mode
    if (!fieldState.multiselect) {
      return fieldState.value.length > 1;
    }
    // If multi-select mode
    return false;
  };

  const sortedItems = () => {
    const { sortBy, sortOrder } = fieldState;
    const sortedArray = [...fieldState.items].sort((a, b) => {
      const valueA = a[sortBy] ? a[sortBy].toString() : '';
      const valueB = b[sortBy] ? b[sortBy].toString() : '';
      // Alphanumeric comparison using localeCompare
      return sortOrder === 'ascending'
        ? valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' })
        : valueB.localeCompare(valueA, undefined, { numeric: true, sensitivity: 'base' });
    });
    return sortedArray;
  };

  const handleSelectionChange = ({ selectedItems }) => {
    const items = selectedItems.map((item) => item.value);
    setFieldState((prevState) => ({
      ...prevState,
      value: items,
    }));
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <MultiSelect
          id={inputId}
          name={fieldState.name}
          label={fieldState.label}
          helperText={__('This is helper text')}
          items={sortedItems()}
          sortItems={(items) => items}
          itemToString={(item) => (item ? item.description : '')}
          value={fieldState.value}
          selectionFeedback="top-after-reopen"
          invalid={isSelectionInvalid()}
          invalidText={__('Please select only one item.')}
          onChange={handleSelectionChange}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={DropdownEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
        onValueChange={(value) => updateAutomationType(value)}
      />
    </div>
  );
};

DynamicDropdown.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicDropdown;
