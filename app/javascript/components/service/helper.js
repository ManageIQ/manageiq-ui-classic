/* eslint-disable camelcase */
import ServiceValidator from './ServiceValidator';
import { DIALOG_FIELD_TYPES, ServiceType } from './constants';
import { API } from '../../http_api';
import {
  formatDate, formatDateTime, currentDate, currentDateTime, serviceRequestDate, serviceRequestDateTime,
} from './helper.dateTime';
import { serviceRequestValue } from './helper.serviceRequest';
import { isObject, isArrayOfObjects } from './helper.field';

/** Function to return an array of options to be used by SingleDropDownField and MultiDropDownField. */
export const defaultFieldOptions = (field, data) => {
  const defaultOptions = [['1', 'Option1'], ['2', 'Option2']];
  if (field.dynamic) {
    const values = (data.isOrderServiceForm && field.values) || defaultOptions;

    return values.map((item) => ({
      id: item.id || item[0],
      text: item.description || item[1],
    }));
  }

  if (field.values.length > 0) {
    let options = field.values.map((item) => ({ id: item.id || item[0], text: item.description || item[1] }));
    if (field.options && field.options.sort_by) {
      options.sort((a, b) => {
        if (a.text > b.text) return 1;
        if (a.text < b.text) return -1;
        return 0;
      });
      if (field.options.sort_order === 'descending') {
        options = options.reverse();
      }
    }

    return options;
  }

  return [];
};

/** Function to extract the dialog_tabs from the api's response. */
export const extractDialogTabs = (apiResponse) => ((apiResponse
  && apiResponse.content
  && apiResponse.content[0]
  && apiResponse.content[0].dialog_tabs)
? apiResponse.content[0].dialog_tabs
: []);

const otherServiceTypesValue = (field) => {
  if (typeof field.default_value === 'string' || field.default_value instanceof String) {
    if (field.default_value === '[]') {
      return { defaultValue: [], defaultType: field.type };
    }
    if (field.type === DIALOG_FIELD_TYPES.checkBox) {
      return { defaultValue: false, defaultType: field.type };
    }
    if (field.type === DIALOG_FIELD_TYPES.tag) {
      return { defaultValue: {}, defaultType: field.type };
    }
    if (field.type === DIALOG_FIELD_TYPES.date) {
      return  { defaultValue: currentDate(), defaultType: field.type };
    }
    if (field.type === DIALOG_FIELD_TYPES.dateTime) {
      return { defaultValue: currentDateTime(), defaultType: field.type };
    }
    return { defaultValue: field.default_value, defaultType: field.type };
  }
  if (Array.isArray(field.default_value)) {
    return { defaultValue: field.default_value || [], defaultType: field.type };
  }
  if (field.default_value === null) {
    return { defaultValue: (field.type === DIALOG_FIELD_TYPES.tag) ? [] : '', defaultType: field.type };
  }
  return { defaultValue: '', defaultType: field.type };
};

/** Function to check and modify the default value of a field. */
export const defaultFieldValue = (field, requestDialogOptions, serviceType) => {
  if (serviceType === ServiceType.request) {
    return serviceRequestValue(field, requestDialogOptions);
  }
  return otherServiceTypesValue(field);
};

/** Function to build the dialog fields data after initial api call. */
const buildDialogFields = (apiResponse, requestDialogOptions, serviceType) => {
  const dialogFields = {};
  const groupFieldsByTab = {};
  const tabs = extractDialogTabs(apiResponse);
  tabs.forEach((tab, tabIndex) => {
    tab.dialog_groups.forEach((group) => {
      group.dialog_fields.forEach((field) => {
        const { defaultValue, defaultType } = defaultFieldValue(field, requestDialogOptions, serviceType);
        const { value, valid, message } = ServiceValidator.validateField({ field, value: defaultValue, requestDialogOptions });
        dialogFields[field.name] = {
          value, valid, message, type: defaultType, tabIndex
        };
        groupFieldsByTab[tabIndex] = [...groupFieldsByTab[tabIndex] || [], field.name];
      });
    });
  });
  return { dialogFields, groupFieldsByTab };
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

export const processDropdownOrTag = (value) => {
  if (isObject(value)) {
    return value && value.id ? value.id.toString() : value.toString();
  }
  if (isArrayOfObjects(value)) {
    return value.map((i) => i.id.toString());
  }
  return value;
};

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
export const fetchInitialData = async(url, requestDialogOptions, serviceType) => {
  try {
    const apiResponse = await API.get(url, { skipErrors: [500] });
    const {dialogFields, groupFieldsByTab} = buildDialogFields(apiResponse, requestDialogOptions, serviceType);
    return {
      isLoading: false,
      apiResponse,
      dialogFields,
      groupFieldsByTab,
    };
  } catch {
    console.error('Unexpected error occurred while fetching the data.');
    throw new Error('Fetch error');
  }
};

/** Function to reformat the value needed by each field to be sent to the existing API. */
export const reformatValue = (type, value) => {
  const {
    checkBox, date, dateTime, dropDown, radio, tag, textBox, textArea,
  } = DIALOG_FIELD_TYPES;
  switch (type) {
    case checkBox:
      return value ? 't' : 'f';
    case date:
      return formatDate(value);
    case dateTime:
      return formatDateTime(value);
    case dropDown:
    case tag:
      return processDropdownOrTag(value);
    case radio:
    case textBox:
    case textArea:
    default:
      return value;
  }
};

/** Function to omit the 'valid' key from the dialogFields during a field-refresh event and during form-submit event.
  * This data is then used as a params for the refresh field action.  */
export const omitValidation = (dialogFields) => {
  const data = Object.entries(dialogFields).map(([key, { type, value }]) => [key, reformatValue(type, value)]);
  return Object.fromEntries(data);
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
