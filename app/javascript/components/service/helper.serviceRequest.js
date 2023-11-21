import { DIALOG_FIELD_TYPES } from './constants';
import { serviceRequestDate, serviceRequestDateTime } from './helper.dateTime';
import { isObject, isArrayOfObjects } from './helper.field';

/** Function to convert other field types to text box */
const updateFieldTypeToTextBox = (field) => {
  field.type = DIALOG_FIELD_TYPES.textBox;
};

const getFinalKey = (key) => key.split('::').pop().replace(/^dialog_/, '');

const prepareUpdatedData = (requestDialogOptions) => Object.keys(requestDialogOptions).reduce((data, key) => {
  const finalKey = getFinalKey(key);
  data[finalKey] = requestDialogOptions[key];
  return data;
}, {});

/** Function to handle how the data must be presented for dropdown field. */
const handleDropDownField = (field, updatedData) => {
  updateFieldTypeToTextBox(field);
  if (isObject(updatedData[field.name])) {
    return updatedData[field.name].label;
  }
  if (isArrayOfObjects(updatedData[field.name])) {
    if (field.values) {
      return updatedData[field.name]
        .map((item) => {
          const match = field.values.find((pair) => pair[0] === item.value);
          return match ? match[1] : null;
        })
        .filter(Boolean)
        .join(', ');
    }
    return updatedData[field.name].map((item) => item.label).join(', ');
  }
  return updatedData[field.name].toString();
};

/** Function to handle how the data must be presented for checkbox field. */
const handleCheckBoxField = (updatedData, field) => (updatedData[field.name] === 't');

/** Function to handle how the data must be presented for tag field. */
const handleTagField = (field, updatedData) => {
  updateFieldTypeToTextBox(field);
  return field.values
    .filter((i) => updatedData[field.name].includes(i.id))
    .map((j) => j.description)
    .join(', ');
};

/** Function to handle how the data must be presented for date field. */
const handleDateField = (field, updatedData) => {
  updateFieldTypeToTextBox(field);
  return serviceRequestDate(updatedData[field.name]);
};

/** Function to handle how the data must be presented for date field. */
const handleDateTimeField = (field, updatedData) => {
  updateFieldTypeToTextBox(field);
  return serviceRequestDateTime(updatedData[field.name]);
};

/** Function to prepare the data needed for the Service / Request page.
 * This also converts the fields like DropDown, Tag, Date, DateTime into TextBox.
 */
export const serviceRequestValue = (field, requestDialogOptions) => {
  try {
    const updatedData = prepareUpdatedData(requestDialogOptions);

    if (!Object.keys(updatedData).includes(field.name)) {
      updateFieldTypeToTextBox(field);
      return '<None>';
    }

    if (updatedData[field.name] && updatedData[field.name].toString().length > 0) {
      switch (field.type) {
        case DIALOG_FIELD_TYPES.dropDown:
          return { defaultValue: handleDropDownField(field, updatedData), defaultType: DIALOG_FIELD_TYPES.textBox };
        case DIALOG_FIELD_TYPES.checkBox:
          return { defaultValue: handleCheckBoxField(updatedData, field), defaultType: DIALOG_FIELD_TYPES.checkBox };
        case DIALOG_FIELD_TYPES.tag:
          return { defaultValue: handleTagField(field, updatedData), defaultType: DIALOG_FIELD_TYPES.textBox };
        case DIALOG_FIELD_TYPES.date:
          return { defaultValue: handleDateField(field, updatedData), defaultType: DIALOG_FIELD_TYPES.textBox };
        case DIALOG_FIELD_TYPES.dateTime:
          return { defaultValue: handleDateTimeField(field, updatedData), defaultType: DIALOG_FIELD_TYPES.textBox };
        default:
          return { defaultValue: updatedData[field.name].toString(), defaultType: DIALOG_FIELD_TYPES.textBox };
      }
    } else {
      return { defaultValue: '', defaultType: DIALOG_FIELD_TYPES.textBox };
    }
  } catch (error) {
    console.log('Unexpected Error in assigning the data.', error);
  }
};
