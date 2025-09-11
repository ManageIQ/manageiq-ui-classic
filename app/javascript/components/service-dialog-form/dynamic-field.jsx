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
    switch (type) {
      case 'DialogFieldTextBox':
        return 1;
      case 'DialogFieldTextAreaBox':
        return 2;
      case 'DialogFieldCheckBox':
        return 3;
      case 'DialogFieldDropDownList':
        return 4;
      case 'DialogFieldRadioButton':
        return 5;
      case 'DialogFieldDateControl':
        return 6;
      case 'DialogFieldDateTimeControl':
        return 7;
      case 'DialogFieldTagControl':
        return 8;
      default:
        return 1; // Default to text box
    }
  };

  const fieldSelector = (fieldData) => {
    const componentId = fieldData.field.componentId
                       || (fieldData.field.type && getComponentIdFromType(fieldData.field.type))
                       || 1; // Default to text box

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
