import React from 'react';
import PropTypes from 'prop-types';
import { TextInput, FormLabel } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, overridableOptions, fieldTab, dynamicFields,
} from './dynamic-field-configuration';
/** Component to render a Field. */
const DynamicTextInput = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const fieldActions = (event, type) => onFieldAction({
    event,
    fieldPosition,
    type,
  });

  const dynamicTextBoxOptions = () => ([
    dynamicFields.entryPoint,
    dynamicFields.showRefresh,
    dynamicFields.loadOnInit,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const ordinaryTextBoxOptions = () => ([
    dynamicFields.defaultValue,
    dynamicFields.required,
    dynamicFields.protected,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.valueType,
    dynamicFields.validation,
    dynamicFields.validator,
    dynamicFields.fieldsToRefresh,
  ]);

  const textboxOptions = (dynamic) => ({
    name: fieldTab.options,
    fields: dynamic ? dynamicTextBoxOptions() : ordinaryTextBoxOptions(),
  });

  const textBoxEditFields = (dynamic) => {
    const tabs = [
      fieldInformation(),
      textboxOptions(dynamic),
      advanced(),
    ];
    if (dynamic) {
      tabs.push(overridableOptions());
    }
    return tabs;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <FormLabel>
          Text Box
        </FormLabel>
        <TextInput
          id={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-input`}
          labelText={__('Text Box')}
          hideLabel
          placeholder={__('Default value')}
          name={`tab-${tabId}-section-${sectionId}-field-${fieldPosition}-text-input`}
          title={__('Text Box')}
          onChange={(event) => fieldActions(event, SD_ACTIONS.textInputOnchange)}
        />
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        dynamicFieldAction={(action) => console.log(action, field)}
        fieldConfiguration={textBoxEditFields(false)}
      />
    </div>
  );
};

DynamicTextInput.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTextInput;
