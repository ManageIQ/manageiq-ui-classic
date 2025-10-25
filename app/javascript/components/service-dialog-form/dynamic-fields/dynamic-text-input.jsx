import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextInput } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS, getFieldValues } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTextInput = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});
  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-input`;
  const editActionType = SD_ACTIONS.field.edit;

  const refreshEnabledFields = section.fields
    .filter((field) => field.showRefresh)
    .map((field) => ({ value: field.label, label: field.label }));

  // Initialize field state with values from the helper function
  const fieldValues = getFieldValues(field);
  const [fieldState, setFieldState] = useState({
    ...fieldValues,
    position: fieldPosition,
    name: fieldValues.name || inputId,
    fieldsToRefresh: refreshEnabledFields,
  });

  const handleFieldUpdate = (event, updatedFields) => {
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

  const ordinaryTextBoxOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.protected,
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.validatorRule,
    dynamicFields.validatorMessage,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTextBoxOptions = () => ([
    dynamicFields.automateEntryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.validatorRule,
    dynamicFields.validatorMessage,
    dynamicFields.fieldsToRefresh,
  ]);

  const textboxOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicTextBoxOptions() : ordinaryTextBoxOptions(),
  });

  const textBoxEditFields = () => {
    const tabs = [
      fieldInformation(),
      textboxOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
      tabs.push(overridableOptions());
    }
    return tabs;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <TextInput
          id={inputId}
          name={fieldState.name}
          labelText={fieldState.label}
          helperText={fieldState.helperText}
          placeholder={__('Default value')}
          value={fieldState.value}
          readOnly={fieldState.readOnly}
          onChange={(e) => handleFieldUpdate(e, { value: e.target.value })}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={textBoxEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicTextInput.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextInput;
