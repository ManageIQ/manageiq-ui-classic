import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS, getFieldValues } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicCheckbox = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId, fields } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-checkbox`;
  const editActionType = SD_ACTIONS.field.edit;

  const refreshEnabledFields = fields.reduce((result, field) => {
    if (field.showRefresh) {
      result.push({ value: field.label, label: field.label });
    }
    return result;
  }, []);

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

  const ordinaryCheckboxOptions = () => ([
    dynamicFields.defaultCheckboxValue,
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicCheckboxOptions = () => ([
    dynamicFields.automateEntryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.fieldsToRefresh,
  ]);

  const checkboxOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicCheckboxOptions() : ordinaryCheckboxOptions(),
  });

  const checkboxEditFields = () => {
    const tabs = [
      fieldInformation(),
      checkboxOptions(),
      advanced(),
    ];
    if (fieldState.dynamic) {
      tabs.push(overridableOptions('checkBox'));
    }
    return tabs;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <Checkbox
          id={inputId}
          name={fieldState.name}
          labelText={fieldState.label}
          required={fieldState.required}
          checked={fieldState.checked}
          onChange={(e) => handleFieldUpdate(e, { checked: e })}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={checkboxEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicCheckbox.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicCheckbox;
