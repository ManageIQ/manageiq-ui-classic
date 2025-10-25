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
    // Determine component ID
    const { field } = fieldData;
    const componentId = field.componentId || getComponentIdFromType(field.type || '');

    // Map component IDs to their respective React components
    const componentMap = {
      1: DynamicTextInput,
      2: DynamicTextArea,
      3: DynamicCheckbox,
      4: DynamicDropdown,
      5: DynamicRadioButton,
      6: DynamicDatepicker,
      7: DynamicTimepicker,
      8: DynamicTagControl,
    };
    
    // Get the component based on componentId or default to DynamicTextInput
    const Component = componentMap[componentId] || DynamicTextInput;
    
    // Return the component with common props
    return <Component
      dynamicFieldData={fieldData}
      onFieldAction={onFieldAction}
    />;
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
