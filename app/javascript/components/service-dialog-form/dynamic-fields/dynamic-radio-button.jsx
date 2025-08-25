import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import { defaultRadioButtonOptions } from '../edit-field-modal/fields.schema';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptionsWithSort, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicRadioButton = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-group`;
  const editActionType = SD_ACTIONS.field.edit;
  const refreshEnabledFields = section.fields
    .filter((field) => field.showRefresh)
    .map((field) => ({ value: field.label, label: field.label }));

  const [fieldState, setFieldState] = useState({
    type: 'DialogFieldRadioButton',
    position: fieldPosition,
    label: __('Radio Button'),
    required: false,
    name: inputId,
    visible: true,
    items: defaultRadioButtonOptions,
    value: '',
    fieldsToRefresh: refreshEnabledFields,
    sortBy: 'description',
    sortOrder: 'ascending',
  });

  const handleFieldUpdate = (event, updatedFields) => {
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    onFieldAction({ event, type: editActionType, fieldPosition, inputProps: { ...fieldState, ...updatedFields } });
  };

  const handleSelectionChange = (selectedItem) => {
    setFieldState((prevState) => ({
      ...prevState,
      value: selectedItem,
    }));
  };

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : editActionType;
    // setFieldState((prevState) => ({ ...prevState, ...updatedFields }));

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

  const ordinaryRadioButtonOptions = () => ([
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.required,
    dynamicFields.defaultDropdownValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.entries,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicRadioButtonOptions = () => ([
    dynamicFields.automateEntryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.valueType,
    dynamicFields.fieldsToRefresh,
  ]);

  const radioButtonOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicRadioButtonOptions() : ordinaryRadioButtonOptions(),
  });

  const radioButtonEditFields = () => {
    const tabs = [
      fieldInformation(),
      radioButtonOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
      tabs.push(overridableOptionsWithSort());
    }
    return tabs;
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

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <RadioButtonGroup
          legendText="Radio Button group"
          name={fieldState.name}
          onChange={(selectedValue) => handleSelectionChange(selectedValue)}
          valueSelected={fieldState.value}
        >
          {sortedItems().map((option) => (
            <RadioButton
              key={option.id}
              id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-${option.id}`}
              labelText={__(option.text)}
              name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-radio-button-${option.id}`}
              value={option.id}
            />
          ))}
        </RadioButtonGroup>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={radioButtonEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicRadioButton.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicRadioButton;
