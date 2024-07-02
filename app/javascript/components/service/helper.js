/* eslint-disable camelcase */
import ServiceValidator from './ServiceValidator';
import { DIALOG_FIELD_TYPES } from './constants';
import { API } from '../../http_api';

/** Function to render the required label in the form component label */
export const requiredLabel = (isRequired) => (isRequired ? __('Required') : '');

/** Function to generate a string to be used as the field id. */
export const fieldComponentId = (field) => `${field.name}-${field.type}-${field.id}`;

export const currentTime = () => {
  const now = new Date();
  const hours = [...Array(24)].map((_, hour) => ({ id: hour, text: hour.toString().padStart(2, '0') }));
  const minutes = [...Array(60)].map((_, minute) => ({ id: minute, text: minute.toString().padStart(2, '0') }));
  const hour = hours.find((hour) => hour.id === now.getHours()).id;
  const minute = minutes.find((min) => min.id === now.getMinutes()).id;
  return {
    hours, minutes, hour, minute,
  };
};

export const currentDate = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();
  return { day, month, year };
};

export const currentDateTime = () => ({ ...currentDate(), ...currentTime() });

export const dateString = ({ day, month, year }) => {
  if (day && month && year) {
    return `${month}/${day}/${year}`;
  }
  return undefined;
};

export const dateTimeString = (data) => {
  const date = dateString(data);
  return {
    date,
    hour: { id: data.hour, text: data.hour.toString().padStart(2, '0') },
    minute: { id: data.minute, text: data.minute.toString().padStart(2, '0') },
  };
};

/** Function to reformat the selected date during the DateField onchange event."
 * inputDate format eg: 'Sat Jul 13 2024 00:00:00 GMT+0530 (India Standard Time)'
 * */
export const extractDate = (inputDate) => {
  if (!inputDate) {
    return { day: undefined, month: undefined, year: undefined };
  }
  const date = new Date(inputDate);
  const pad = (n) => n.toString().padStart(2, '0');
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1); // months are zero-based
  const day = pad(date.getUTCDate() + 1);

  return { day, month, year };
};

export const extractDateTime = (inputDate, time) => {
  const date = extractDate(inputDate);
  const { hour, minute } = time;
  return { ...date, hour: hour.id, minute: minute.id };
};

/** Function to extract the dialog_tabs from the api's response. */
export const extractDialogTabs = (apiResponse) => ((apiResponse
    && apiResponse.content
    && apiResponse.content[0]
    && apiResponse.content[0].dialog_tabs)
  ? apiResponse.content[0].dialog_tabs
  : []);

/** Function to check and modify the default value of a field. */
export const defaultFieldValue = (field) => {
  if (typeof field.default_value === 'string' || field.default_value instanceof String) {
    if (field.default_value === '[]') {
      return [];
    }
    if (field.type === DIALOG_FIELD_TYPES.checkBox) {
      return false;
    }
    if (field.type === DIALOG_FIELD_TYPES.tag) {
      return [];
    }
    if (field.type === DIALOG_FIELD_TYPES.date) {
      return currentDate();
    }
    if (field.type === DIALOG_FIELD_TYPES.dateTime) {
      return currentDateTime();
    }
    return field.default_value;
  }
  if (Array.isArray(field.default_value)) {
    return field.default_value || [];
  }
  if (field.default_value === null) {
    return (field.type === DIALOG_FIELD_TYPES.tag) ? [] : '';
  }
  return '';
};

/** Function to build the dialog fields data after initial api call. */
const buildDialogFields = (apiResponse, isOrderServiceForm) => {
  const dialogFields = {};
  const tabs = extractDialogTabs(apiResponse);
  tabs.forEach((tab) => {
    tab.dialog_groups.forEach((group) => {
      group.dialog_fields.forEach((field) => {
        const defaultValue = defaultFieldValue(field);
        const { value, valid } = ServiceValidator.validateField({ field, value: defaultValue, isOrderServiceForm });
        dialogFields[field.name] = { value, valid };
      });
    });
  });
  return dialogFields;
};

/** Function to extract the remaining fields to be refreshed and pick the field that needs to be refreshed next. */
const refreshData = (fieldsToRefresh) => {
  let currentRefreshField;
  const fieldsToRefreshCopy = [...fieldsToRefresh]; // Create a shallow copy
  if (fieldsToRefreshCopy.length > 0) {
    currentRefreshField = fieldsToRefreshCopy.shift(); // Select the first item from the array.
  }
  return { remaining: fieldsToRefreshCopy, currentRefreshField };
};

/** Function to omit the 'valid' key from the dialogFields during a field-refresh event and during form-submit event.
 * This data is then used as a params for the refresh field action.  */
export const omitValidation = (dialogFields) => Object.fromEntries(Object.entries(dialogFields).map(([key, { value }]) => [key, value]));

/** Function to update the initial apiResponse when the refresh action has returned with the new result */
const updateRefreshResponse = (apiResponse, currentRefreshField, result) => {
  const data = result[currentRefreshField];
  apiResponse.content[0].dialog_tabs.map((tab) => tab.dialog_groups.map((group) => group.dialog_fields.forEach((field) => {
    if (field.name === currentRefreshField) {
      field.data_type = data.data_type;
      field.options = data.options;
      field.read_only = data.read_only;
      field.required = data.required;
      field.visible = data.visible;
      field.values = data.values;
      field.default_value = data.default_value;
      field.validator_rule = data.validator_rule;
      field.validator_type = data.validator_type;
    }
    return field;
  })));
  return { updatedApiResponse: { ...apiResponse }, responders: data.dialog_field_responders };
};

/** Function to fetch initial API data. */
export const fetchInitialData = async(url, isOrderServiceForm) => {
  try {
    const apiResponse = await API.get(url, { skipErrors: [500] });
    return {
      isLoading: false,
      apiResponse,
      dialogFields: buildDialogFields(apiResponse, isOrderServiceForm),
    };
  } catch {
    console.error('Unexpected error occurred while fetching the data.');
    throw new Error('Fetch error');
  }
};

/** Function to handle refreshing field data. */
export const refreshFieldData = async(newData, resource) => {
  const { remaining, currentRefreshField } = refreshData(newData.fieldsToRefresh);
  const params = {
    action: 'refresh_dialog_fields',
    resource: {
      ...resource,
      dialog_fields: omitValidation(newData.dialogFields),
      fields: [currentRefreshField],
    },
  };

  try {
    const { result } = await API.post(`/api/service_dialogs/${newData.apiResponse.id}`, params);
    const { updatedApiResponse, responders } = updateRefreshResponse(newData.apiResponse, currentRefreshField, result);
    return { updatedApiResponse, remaining, responders };
  } catch (_error) {
    console.error('Unexpected error occurred when the field was refreshed.');
    throw _error;
  }
};
