import { API, http } from '../../http_api';

/** Function which returns the data needed for timezone drop-down-list */
export const timeZoneData = (timezones) => timezones.map((timezone) => ({ value: timezone.name, label: timezone.description }));

/** Function to check if an item is array. if yes, returns true, else returns false */
const isArray = (item) => Array.isArray(item);

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
  if (value === 'automation_request') {
    Promise.all([
      http.post('/ops/automate_schedules_set_vars/new'),
      API.get('/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending'),
    ]).then(([response, { resources }]) => {
      setData({
        ...data,
        displayFields: {
          ...data.displayFields, hideFilterType: true, hideTarget: true, hideAutomationFields: false,
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
    data.initialValues.filter_typ = 'all';
    setData({
      ...data,
      displayFields: {
        ...data.displayFields, hideFilterType: false, hideAutomationFields: true, hideObjectItem: true, hideTarget: true,
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
  if (value && data.displayFields.hideAutomationFields === false) {
    http.post(`/ops/fetch_target_ids/?target_class=${value}`).then(({ targets }) => {
      setData({
        ...data,
        displayFields: {
          ...data.displayFields, hideObjectItem: false,
        },
        options: {
          ...data.options,
          objectItem: restructureOptions(targets),
        },
      });
    });
  }
};

/** Function to load the target options when the 'Filter' drop-down-list selection is changed  */
export const subActionChange = (value, setData, data) => {
  data.initialValues.filter_type = value;
  if (value !== 'all' && data.displayFields.hideFilterType === false) {
    http.post('/ops/schedule_form_filter_type_field_changed/new',
      { filter_type: value, action_type: data.initialValues.action_typ }).then((response) => {
      setData({
        ...data,
        displayFields: {
          ...data.displayFields, hideTarget: false,
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
        ...data.displayFields, hideTarget: true,
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
  data.displayFields.hideEveryTime = false;
  if (value === 'Once') {
    data.displayFields.hideEveryTime = true;
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

/** Function to set the values in edit form */
export const setInitialData = (recordId, data, setData, filterOptions) => {
  Promise.all([
    http.get(`/ops/schedule_form_fields/${recordId}`),
    API.get('/api'),
    API.get('/api/zones/?expand=resources&attributes=id,description&sort_by=description&sort_order=ascending'),
  ]).then(([scheduleResponse, { timezones }, { resources }]) => {
    if (scheduleResponse.action_type === 'automation_request') {
      data.options.request = restructureOptions(scheduleResponse.instance_names);
      data.options.objectType = restructureOptions(scheduleResponse.target_classes);
      data.options.objectItem = restructureOptions(scheduleResponse.targets);
      data.displayFields.hideObjectItem = false;
      data.displayFields.hideFilterType = true;
    } else {
      data.options.subAction = getSubActionOptions(scheduleResponse.action_type, filterOptions);
      if (scheduleResponse.filter_value) {
        data.options.target = restructureOptions(scheduleResponse.filtered_item_list, true);
      }
    }
    if (scheduleResponse.schedule_timer_type !== 'Once') {
      data.options.everyTime = runChange(scheduleResponse.schedule_timer_type);
    }
    data.timerInit = scheduleResponse.schedule_timer_value;
    setData({
      ...data,
      initialValues: { ...data.initialValues, ...restructureScheduleResponse(scheduleResponse) },
      displayFields: { ...data.displayFields, hideAutomationFields: scheduleResponse.action_type !== 'automation_request' },
      options: {
        ...data.options,
        timezone: timeZoneData(timezones),
        zone: resources.map((item) => ({ label: item.description, value: item.id })),
      },
      isLoading: false,
    });
  });
};
