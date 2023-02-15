/* eslint-disable camelcase */
import { API, http } from '../../http_api';

export const scheduleConst = {
  automation: 'automation_request',
  all: 'all',
  once: 'Once',
  vm: 'vm',
};

/** Function which returns the data needed for timezone drop-down-list */
export const timeZoneData = (timezones) => timezones.map((timezone) => ({ value: timezone.name, label: timezone.description }));

/** Function to check if an item is object. if yes, returns true, else returns false */
export const isObject = (data) => typeof (data) === 'object';

/** Function to check if an item is array. if yes, returns true, else returns false */
const isArray = (item) => Array.isArray(item);

/** Function to check if schedule action is automation */
const isAutomation = (actionType) => actionType === scheduleConst.automation;

/** To swap the index of the recieved array when api gives the array ['value', 'label]
* occurs when we select the sub action options */
const swapIndex = (valueFirst) => {
  let indexes = { label: 0, value: 1 };
  if (valueFirst) {
    indexes = { label: 1, value: 0 };
  }
  return indexes;
};

/** Function to get the options.
 * The data is either array of strings eg: ['aaa','bbb'] or
 * array of string arrays eg: [['aaa','bbb], ['ccc','ddd']] */
export const restructureOptions = (data, valueFirst = false) => {
  const index = swapIndex(valueFirst);
  if (!data) { return []; } return data.map((item) => (
    isArray(item)
      ? ({ label: item[index.label], value: item[index.value] })
      : ({ label: item, value: item })));
};

/** Function to return the filter options based on the selected action value. */
export const subActionOptions = (value, filterOptions) => filterOptions.find((item) => item.keys.includes(value)).option;

/** Function to return the filter options based on the selected action value.
 * Once the data is extracted, it is restructured for the drop-down-list.
*/
export const getSubActionOptions = (value, filterOptions) => {
  const options = subActionOptions(value, filterOptions);
  return restructureOptions(options);
};

/** Function to load the filter options when the 'Action' drop-down-list selection is changed  */
export const actionChange = (value, filterOptions, setData, data) => {
  data.initialValues.action_typ = value;
  if (isAutomation(value)) {
    Promise.all([
      http.post('/ops/automate_schedules_set_vars/new'),
      API.get('/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending'),
    ]).then(([response, { resources }]) => {
      setData({
        ...data,
        displayFields: {
          ...data.displayFields, filterType: true, target: true, automationFields: false,
        },
        options: {
          ...data.options,
          request: restructureOptions(response.instance_names),
          objectType: restructureOptions(response.target_classes),
          zone: resources.map((item) => ({ label: item.description, value: item.id })),
        },
      });
    });
  } else {
    data.initialValues.filter_typ = scheduleConst.all;
    setData({
      ...data,
      displayFields: {
        ...data.displayFields, filterType: false, automationFields: true, objectItem: true, target: true,
      },
      options: {
        ...data.options,
        subAction: getSubActionOptions(value, filterOptions),
      },
    });
  }
};

/** Function to load the object items when the 'Object Type' drop-down-list selection is changed  */
export const objectTypeChange = (value, setData, data) => {
  if (value && data.displayFields.automationFields === false) {
    http.post(`/ops/fetch_target_ids/?target_class=${value}`).then(({ targets }) => {
      setData({
        ...data,
        displayFields: {
          ...data.displayFields, objectItem: false,
        },
        options: {
          ...data.options,
          objectItem: restructureOptions(targets),
        },
      });
    });
  }
};

/** Function to load the target options when the 'Filter' drop-down list selection is changed  */
export const subActionChange = (value, setData, data) => {
  data.initialValues.filter_type = value;
  if (value !== scheduleConst.all && data.displayFields.filterType === false) {
    http.post('/ops/schedule_form_filter_type_field_changed/new',
      { filter_type: value, action_type: data.initialValues.action_typ }).then((response) => {
      setData({
        ...data,
        displayFields: {
          ...data.displayFields, target: false,
        },
        options: {
          ...data.options,
          target: restructureOptions(response.filtered_item_list, true),
        },
      });
    });
  } else {
    setData({
      ...data,
      displayFields: {
        ...data.displayFields, target: true,
      },
    });
  }
};

/** Run options data needed for the run drop-down-list */
const runTypes = {
  Once: {
    label: __('Once'), singular: __('Once'), type: 'Once', options: [],
  },
  Hourly: {
    label: __('Hours'), singular: __('Hour'), type: 'Hourly', options: [1, 2, 3, 4, 6, 8, 12],
  },
  Daily: {
    label: __('Days'), singular: __('Day'), type: 'Daily', options: [1, 2, 3, 4, 5, 6],
  },
  Weekly: {
    label: __('Weeks'), singular: __('Week'), type: 'Weekly', options: [1, 2, 3, 4],
  },
  Monthly: {
    label: __('Months'), singular: __('Month'), type: 'Monthly', options: [1, 2, 3, 4, 5, 6],
  },
};

/** Function to pluralize the time option labels */
const pluralizeTime = (label, singular, value) => {
  const pluralizeLabel = value === 1 ? singular : label;
  return `${value} ${pluralizeLabel}`;
};

/** Function to load the `Run` Select field options */
export const runOptions = () =>
  Object.values(runTypes).map((item) => ({ label: item.label, value: item.type }));

/** Function to return the data needed for the selected run drop-down-list */
const timerOptions = ({ options, label, singular }) => options.map((value) => ({ value, label: pluralizeTime(label, singular, value) }));

/** Function to handle the run drop-down-list on change event */
export const runChange = (value) => timerOptions(runTypes[value]);

/** Function to load the object items when the 'Object Type' drop-down-list selection is changed  */
export const runOptionChange = (value, setData, data) => {
  data.displayFields.everyTime = false;
  if (value === scheduleConst.once) {
    data.displayFields.everyTime = true;
  }

  setData({
    ...data,
    options: {
      ...data.options,
      everyTime: runChange(value),
    },
  });
};

/** Function to format the time in edit form:
 * For Example 2:5 will be converted to 02:05
 */
const formatTime = (hour, minute) => {
  const limit = 9;
  const hh = hour > limit ? hour : `0${hour}`;
  const mm = minute > limit ? minute : `0${minute}`;
  return `${hh}:${mm}`;
};

/** Function to load the values in the edit form  */
export const restructureScheduleResponse = (response) => {
  const restructuredResponse = {
    action_typ: response.action_type,
    filter_typ: response.filter_type,
    name: response.schedule_name,
    description: response.schedule_description,
    enabled: response.schedule_enabled,
    start_date: response.schedule_start_date,
    start_hour: formatTime(response.schedule_start_hour, response.schedule_start_min),
    time_zone: response.schedule_time_zone,
    timer_typ: response.schedule_timer_type,
    timer_value: response.schedule_timer_value,
  };
  if (response.ui_attrs) {
    response.ui_attrs.forEach((element, index) => {
      // eslint-disable-next-line prefer-destructuring
      restructuredResponse[`attribute_${index + 1}`] = element[0];
      // eslint-disable-next-line prefer-destructuring
      restructuredResponse[`value_${index + 1}`] = element[1];
    });
  } else {
    [...Array(5)].forEach((_item, index) => {
      restructuredResponse[`attribute_${index + 1}`] = '';
      restructuredResponse[`value_${index + 1}`] = '';
    });
  }
  return { ...response, ...restructuredResponse };
};

/** Set edit form select box options from schedule response */
const restructureInitialOptions = (scheduleResponse, filterOptions, timezones, resources) => {
  const {
    instance_names, target_classes, targets, action_type, filtered_item_list, filter_value, schedule_timer_type,
  } = scheduleResponse;
  let options = {};

  if (isAutomation(action_type)) {
    options = {
      request: restructureOptions(instance_names),
      objectType: restructureOptions(target_classes),
      objectItem: restructureOptions(targets),
    };
  } else {
    options = { subAction: getSubActionOptions(action_type, filterOptions) };

    if (filter_value) options.target = restructureOptions(filtered_item_list, true);
  }

  if (schedule_timer_type !== scheduleConst.once) options.everyTime = runChange(schedule_timer_type);

  return {
    ...options,
    timezone: timeZoneData(timezones),
    zone: resources.map((item) => ({ label: item.description, value: item.id })),
  };
};

/** Set edit form display values based on schedule response */
const restructureInitialDisplayFields = ({ action_type }) => {
  let displayFields = {};
  const automation = isAutomation(action_type);
  if (automation) {
    displayFields = {
      objectItem: false,
      filterType: true,
    };
  }
  return {
    ...displayFields,
    automationFields: !automation,
  };
};

/** Function to set the values in edit form */
export const setInitialData = (recordId, data, setData, filterOptions) => {
  Promise.all([
    http.get(`/ops/schedule_form_fields/${recordId}`),
    API.get('/api'),
    API.get('/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending'),
  ]).then(([scheduleResponse, { timezones }, { resources }]) => {
    setData({
      ...data,
      timerInit: scheduleResponse.schedule_timer_value,
      initialValues: { ...data.initialValues, ...restructureScheduleResponse(scheduleResponse) },
      options: { ...data.options, ...restructureInitialOptions(scheduleResponse, filterOptions, timezones, resources) },
      displayFields: { ...data.displayFields, ...restructureInitialDisplayFields(scheduleResponse) },
      isLoading: false,
    });
  });
};

/** Function to restructure the formdata for save submission */
export const getSubmitData = (formData) => {
  let ui_attrs = [];
  if (isAutomation(formData.action_typ)) {
    ui_attrs = [...Array(5)].map((_item, i) => ([formData[`attribute_${i + 1}`], formData[`value_${i + 1}`]]));
  }
  return {
    ...formData,
    start_date: isObject(formData.start_date[0]) ? formData.start_date[0] : new Date(formData.start_date),
    start_hour: isObject(formData.start_hour) ? formData.start_hour.getHours() : formData.start_hour.split(':')[0],
    start_min: isObject(formData.start_hour) ? formData.start_hour.getMinutes() : formData.start_hour.split(':')[1],
    ui_attrs,
  };
};
