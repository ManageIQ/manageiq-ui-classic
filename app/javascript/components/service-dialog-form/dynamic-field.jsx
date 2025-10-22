import React from 'react';
import PropTypes from 'prop-types';
import DynamicTextInput from './dynamic-fields/dynamic-text-input';
import DynamicTextArea from './dynamic-fields/dynamic-text-area';
import DynamicCheckbox from './dynamic-fields/dynamic-checkbox';
import DynamicDropdown from './dynamic-fields/dynamic-dropdown';
import DynamicRadioButton from './dynamic-fields/dynamic-radio-button';
import DynamicDatepicker from './dynamic-fields/dynamic-date-picker';
import DynamicTimepicker from './dynamic-fields/dynamic-time-picker';
import DynamicTagControl from './dynamic-fields/dynamic-tag-control';
import { dynamicFieldDataProps } from './helper';
/** Component to render a Field. */
const DynamicField = ({ fieldData, onFieldAction }) => {

  // Helper function to determine componentId from field type
  const getComponentIdFromType = (type) => {
    const componentMap = {
      'DialogFieldTextBox': 1,
      'DialogFieldTextAreaBox': 2,
      'DialogFieldCheckBox': 3,
      'DialogFieldDropDownList': 4,
      'DialogFieldRadioButton': 5,
      'DialogFieldDateControl': 6,
      'DialogFieldDateTimeControl': 7,
      'DialogFieldTagControl': 8,
    };
    
    // Return the mapped component ID or default to text box (1)
    return componentMap[type] || 1;
  };

  const fieldSelector = (fieldData) => {
    // Determine component ID with cleaner fallback logic
    const { field } = fieldData;
    const componentId = field.componentId || getComponentIdFromType(field.type || '');

    switch (componentId) {
      case 1:
        return <DynamicTextInput dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 2:
        return <DynamicTextArea dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 3:
        return <DynamicCheckbox dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 4:
        return <DynamicDropdown dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 5:
        return <DynamicRadioButton dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 6:
        return <DynamicDatepicker dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 7:
        return <DynamicTimepicker dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 8:
        return <DynamicTagControl dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      default:
        return <DynamicTextInput dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
    }
  };

  return (
    <>
      {
        fieldSelector(fieldData)
      }
    </>
  );
};

DynamicField.propTypes = {
  fieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicField;
