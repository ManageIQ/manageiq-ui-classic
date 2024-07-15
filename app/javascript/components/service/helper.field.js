/** Function to check if a field is disabled during onLoad or Refresh event. */
const isDisabled = ({ isOrderServiceForm, fieldsToRefresh, locked }) => (!isOrderServiceForm || !!fieldsToRefresh.length > 0 || locked);

/** Function to render the required label in the form component label */
/** Function to render the required label in the form component label */
const requiredLabel = (isRequired, fieldData) => {
  if (isRequired) {
    if (fieldData.value && fieldData.value.length === 0) {
      return __('Required');
    } if (fieldData.message) {
      return fieldData.message;
    }
  }
  return '';
};

/** Function to generate a string to be used as the field id. */
const fieldComponentId = (field) => `${field.name}-${field.type}-${field.id}`;

/** Function to check if the value is an object */
export const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

/** Function to check if the value is an Array */
export const isArrayOfObjects = (value) => Array.isArray(value) && value.every((item) => typeof item === 'object' && !Array.isArray(item));

/** Function to return an object that is required to be used in every field. */
export const fieldProperties = (field, data) => {
  const fieldData = data.dialogFields[field.name];
  return {
    isDisabled: isDisabled(data),
    requiredLabel: requiredLabel(field, fieldData),
    fieldId: fieldComponentId(field),
    fieldData,
  };
};
