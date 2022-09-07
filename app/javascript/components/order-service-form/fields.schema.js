import { componentTypes } from '@@ddf';
// eslint-disable-next-line import/no-cycle
import { buildFields } from './helper';

let dynamicFields = {};

const generateDynamicFields = (field) => {
  dynamicFields = { ...dynamicFields, [field.name]: null };
};

/** Function to build a text box. */
export const buildTextBox = (field, validate, setData) => {
  let component = {};
  generateDynamicFields(field);

  if (field.options.protected) {
    component = {
      component: 'password-field',
      id: field.id,
      name: field.name,
      label: field.label,
      hideField: !field.visible,
      isRequired: field.required,
      isDisabled: field.read_only,
      initialValue: field.default_value,
      description: field.description,
      validate,
    };
  } else {
    component = {
      component: componentTypes.TEXT_FIELD,
      id: field.id,
      name: field.name,
      label: field.label,
      hideField: !field.visible,
      isRequired: field.required,
      isDisabled: field.read_only,
      initialValue: field.default_value,
      description: field.description,
      validate,
      resolveProps: (props, { meta, input }, formOptions) => {
        dynamicFields[input.name] = input.value;
      },
    //   resolveProps: (props, { meta, input }, formOptions) => {
    //     console.log(props);
    //     console.log(meta);
    //     console.log(input);
    //     console.log(formOptions);
    //     if (!formOptions.pristine) {
    //       if (field.dialog_field_responders.length > 0) {
    //         field.dialog_field_responders.forEach((tempField) => {
    //           console.log(tempField);
    //           dynamicFields.forEach((fieldToRefresh) => {
    //             if (fieldToRefresh.field === tempField) {
    //               const refreshData = {
    //                 action: 'refresh_dialog_fields',
    //                 resource: {
    //                   dialog_fields: {
    //                     //   credential: null,
    //                     hosts: 'localhost0',
    //                     //   param_provider_id: '38',
    //                     //   param_miq_username: 'admin',
    //                     //   param_miq_password: 'smartvm',
    //                     //   check_box_1: 't',
    //                     //   dropdown_list_1_1: null,
    //                     //   textarea_box_1: '',
    //                     //   date_time_control_1: '2022-10-12T20:50:45.180Z',
    //                     //   date_time_control_2: '2022-10-12T20:50:45.180Z',
    //                     //   date_control_1: '2022-10-12',
    //                     //   date_control_2_1: '2022-09-27',
    //                   },
    //                   fields: ['credential'],
    //                   resource_action_id: '2018',
    //                   target_id: '14',
    //                   target_type: 'service_template',
    //                   real_target_type: 'ServiceTemplate',
    //                 },
    //               };
    //               fieldToRefresh.values = API.post(`/api/service_dialogs/10`, refreshData).then((data) => {
    //                 console.log(data);
    //               });
    //               console.log(fieldToRefresh);
    //             }
    //           });
    //         });
    //       }
    //     }
    //   },
    };
  }
  return component;
};

/** Function to build a text area */
export const buildTextAreaBox = (field, validate) => ({
  component: componentTypes.TEXTAREA,
  id: field.id,
  name: field.name,
  label: field.label,
  hideField: !field.visible,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: field.default_value,
  description: field.description,
  validate,
});

/** Function to build a check box. */
export const buildCheckBox = (field, validate) => ({
  component: componentTypes.CHECKBOX,
  id: field.id,
  name: field.name,
  label: field.label,
  hideField: !field.visible,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: field.default_value,
  description: field.description,
  validate,
});

/** Function to build a drop down select box. */
export const buildDropDownList = (field, validate) => {
  let options = [];
  let placeholder = __('<Choose>');
  let start;

  field.values.forEach((value) => {
    if (value[0] === null) {
      value[0] = null;
      // eslint-disable-next-line prefer-destructuring
      placeholder = value[1];
    }
    options.push({ value: value[0] !== null ? String(value[0]) : null, label: value[1] });
  });

  if (options[0].value === null) {
    start = options.shift();
  }
  options = options.sort((option1, option2) => {
    if (field.options.sort_by === 'description') {
      if (field.options.sort_order === 'ascending') {
        return option1.label.localeCompare(option2.label);
      }
      return option2.label.localeCompare(option1.label);
    }
    if (field.options.sort_order === 'ascending') {
      return option1.value.localeCompare(option2.value);
    }
    return option2.value.localeCompare(option1.value);
  });
  if (start) {
    options.unshift(start);
  }

  let isMulti = false;
  if (field.options && field.options.force_multi_value) {
    isMulti = true;
  }
  generateDynamicFields(field);
  return {
    component: componentTypes.SELECT,
    id: field.id,
    name: field.name,
    labelText: field.label,
    hideField: !field.visible,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    resolveProps: (props, { meta, input }, formOptions) => {
      dynamicFields[input.name] = input.value;
    },
    options,
    placeholder,
    isSearchable: true,
    simpleValue: true,
    isMulti,
  };
};

/** Function to build a tag control field. */
export const buildTagControl = (field, validate) => {
  const options = [];
  field.values.forEach((value) => {
    if (!value.id) {
      value.id = '-1';
    }
    options.push({ value: value.id, label: value.description });
  });
  return {
    component: componentTypes.SELECT,
    id: field.id,
    name: field.name,
    label: field.label,
    hideField: !field.visible,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    options,
  };
};

/** Function to build a date control field */
export const buildDateControl = (field, validate) => ({
  component: componentTypes.DATE_PICKER,
  id: field.id,
  name: field.name,
  label: field.label,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: field.default_value,
  description: field.description,
  validate,
  variant: 'date-time',
});

/** Function to build a time control field */
export const buildTimeControl = (field, validate, dateTime) => ([{
  component: componentTypes.DATE_PICKER,
  id: field.id,
  name: field.name,
  label: field.label,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: dateTime.toISOString(),
  description: field.description,
  validate,
  variant: 'date-time',
},
{
  component: componentTypes.TIME_PICKER,
  id: `${field.id}-time`,
  name: `${field.name}-time`,
  isRequired: field.required,
  isDisabled: field.read_only,
  initialValue: dateTime,
  validate,
  twelveHoursFormat: true,
  pattern: '(0?[1-9]|1[0-2]):[0-5][0-9]',
}]);

/** Function to build radio buttons fields */
export const buildRadioButtons = (field, validate) => {
  const options = [];
  field.values.forEach((value) => {
    options.push({ value: value[0], label: value[1] });
  });
  return {
    component: componentTypes.RADIO,
    id: field.id,
    name: field.name,
    label: field.label,
    isRequired: field.required,
    isDisabled: field.read_only,
    initialValue: field.default_value,
    description: field.description,
    validate,
    options,
  };
};

/** Function to show/hide loaders near to the fields. */
const fieldSpinner = (fieldName, show) => {
  const activeSpinner = document.getElementById(`refreshSpinner_${fieldName}`);
  activeSpinner.style.display = show ? 'block' : 'none';
};

/** Function to update the response and build the fileds again after field refresh. */
const updateResponseFields = (response, fieldPosition, fieldName, result) => {
  response.content[0].dialog_tabs.map((tab, tabIndex) => {
    if (tabIndex === fieldPosition.tabIndex) {
      tab.dialog_groups.map((group, groupIndex) => {
        if (groupIndex === fieldPosition.groupIndex) {
          const field = group.dialog_fields.find((item) => item.name === fieldName);
          const data = result[fieldName];
          field.data_type = data.data_type;
          field.options = data.options;
          field.read_only = data.read_only;
          field.required = data.required;
          field.visible = data.visible;
          field.values = [['001', 'one'], ['002', 'two']]; // data.values;
          field.default_value = data.default_value;
          field.validator_rule = data.validator_rule;
          field.validator_type = data.validator_type;
        }
        return group;
      });
    }
    return tab;
  });
  return response;
};

/** Function to fetch the field information and update the field value.
 * If another field is linked, the same function is called again to update the linked field.
*/
const refreshFields = (response, params, fieldName, initialData, resource, data, setData, fieldPosition) => {
  fieldSpinner(fieldName, true);
  API.post(`/api/service_dialogs/${response.id}`, params).then(({ result }) => {
    const responders = result[fieldName].dialog_field_responders;
    const newResponse = updateResponseFields(response, fieldPosition, fieldName, result);
    buildFields(newResponse, data, setData, initialData);
    responders.forEach((responderName) => {
      const newParams = {
        ...params,
        resource: { ...resource, fields: [responderName] },
      };
      fieldSpinner(fieldName, false);
      refreshFields(response, newParams, responderName, initialData, resource, data, setData, fieldPosition);
    });
  });
};

/** Function to handle the the refresh button click event. */
const onRefreshField = (response, field, initialData, data, setData, fieldPosition) => {
  const resource = {
    dialog_fields: dynamicFields,
    fields: [field.name],
    resource_action_id: initialData.resourceActionId,
    target_id: initialData.targetId,
    target_type: initialData.targetType,
    real_target_type: initialData.realTargetType,
  };
  const params = {
    action: 'refresh_dialog_fields',
    resource,
  };

  refreshFields(response, params, field.name, initialData, resource, data, setData, fieldPosition);
};

/** Function to build a refresh button near to drop down. */
export const buildRefreshButton = (response, field, initialData, data, setData, fieldPosition) => ({
  component: 'refresh-button',
  id: `refresh_${field.id}`,
  name: `refresh_${field.name}`,
  label: 'Refresh',
  hideField: !field.visible,
  className: 'refresh-button',
  showRefreshButton: field.show_refresh_button,
  fieldName: field.name,
  onRefresh: () => onRefreshField(response, field, initialData, data, setData, fieldPosition),
});
