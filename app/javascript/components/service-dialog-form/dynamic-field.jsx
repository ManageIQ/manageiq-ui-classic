import React from 'react';
import PropTypes from 'prop-types';
import DynamicTextInput from './dynamic-fields/dynamic-text-input';
import DynamicTextArea from './dynamic-fields/dynamic-text-area';
import { dynamicFieldDataProps } from './helper';
/** Component to render a Field. */
const DynamicField = ({ fieldData, onFieldAction }) => {
  const fieldSelector = (fieldData) => {
    switch (fieldData.field.componentId) {
      case 1:
        return <DynamicTextInput dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 2:
        return <DynamicTextArea dynamicFieldData={fieldData} onFieldAction={(newFieldData) => onFieldAction(newFieldData)} />;
      case 3:
        return fieldData.field.componentId;
      case 4:
        return fieldData.field.componentId;
      case 5:
        return fieldData.field.componentId;
      case 6:
        return fieldData.field.componentId;
      case 7:
        return fieldData.field.componentId;
      case 8:
        return fieldData.field.componentId;
      case 9:
        return fieldData.field.componentId;
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
