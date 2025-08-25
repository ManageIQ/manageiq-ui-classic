import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextArea, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';

/** Component to render a Field. */
const DynamicTextArea = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;

  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-area`;
  const editActionType = SD_ACTIONS.field.edit;
  const refreshEnabledFields = section.fields
    .filter((field) => field.showRefresh)
    .map((field) => ({ value: field.label, label: field.label }));

  const [fieldState, setFieldState] = useState({
    type: 'DialogFieldTextAreaBox',
    // resourceType: 'DialogField',
    position: fieldPosition,
    label: __('Text Area'),
    placeholder: '',
    required: false,
    name: inputId,
    visible: true,
    value: '',
    fieldsToRefresh: refreshEnabledFields,
  });

  const handleFieldUpdate = (event, updatedFields) => {
    setFieldState((prevState) => ({ ...prevState, ...updatedFields }));
    // onFieldAction({ ...dynamicFieldData, field: { ...dynamicFieldData.field, ...updatedFields } });
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

  const ordinaryTextAreaOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.validation,
    dynamicFields.validatorRule,
    dynamicFields.validatorMessage,
    dynamicFields.fieldsToRefresh,
  ]);

  const dynamicTextAreaOptions = () => ([
    dynamicFields.automateEntryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.validation,
    dynamicFields.validatorRule,
    dynamicFields.validatorMessage,
    dynamicFields.fieldsToRefresh,
  ]);

  const textAreaOptions = () => ({
    name: fieldTab.options,
    fields: fieldState.dynamic ? dynamicTextAreaOptions() : ordinaryTextAreaOptions(),
  });

  const textAreaEditFields = () => {
    const tabs = [
      fieldInformation(),
      textAreaOptions(),
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
        {/* <FormLabel>
          Text Area
        </FormLabel> */}
        <TextArea
          id={inputId}
          name={fieldState.name}
          labelText={fieldState.label}
          placeholder={fieldState.placeholder}
          required={fieldState.required}
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
        fieldConfiguration={textAreaEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
      />
    </div>
  );
};

DynamicTextArea.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextArea;
