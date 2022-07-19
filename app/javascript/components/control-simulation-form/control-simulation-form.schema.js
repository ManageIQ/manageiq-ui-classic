import { componentTypes, validatorTypes } from '@@ddf';

const loadTypeEventDropDownFunc = (value) => API.get(`/api/event_definition_sets/${value}/events?expand=resources`).then((valuesReceived) => valuesReceived.resources.map(({
  description, name,
}) => ({
  label: description,
  value: name,
})));

const buildFilterValueOptions = (options) => {
  var newOptions = [];
  Object.keys(options).forEach((key) => {
    newOptions.push({
      value: key,
      label: options[key],
    });
  });
  newOptions.sort(function(a,b){
    var textA = a.label;
    var textB = b.label;
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;    
  })
  return newOptions;
};

const filterTypes = [{
  label: __('By Cloud/Infrastructure Providers'),
  value: 'emss',
}, {
  label: __('By Clusters'),
  value: 'clusters',
}, {
  label: __('By Host'),
  value: 'hosts',
}, {
  label: __('Single VM/Instance'),
  value: 'vms',
}];

const createSchema = (data, typeId, filterTypeId, setState, eventSelectionTypeArray) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'event-selection',
      name: 'event-selection',
      title: __('Event Selection'),
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'type',
          name: 'type',
          label: __('Type'),
          isRequired: true,
          includeEmpty: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          options: eventSelectionTypeArray || [],
          onChange: (typeId) => setState((state) => ({ ...state, typeId })),
        },
        {
          component: componentTypes.SELECT,
          id: 'type_event',
          name: 'type_event',
          key: `type_event-${typeId}`,
          label: __('Event'),
          isRequired: true,
          includeEmpty: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          loadOptions: () => (typeId ? loadTypeEventDropDownFunc(typeId) : Promise.resolve([])),
          condition: {
            when: 'type',
            isNotEmpty: true,
          },
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'vm-selection',
      name: 'vm-selection',
      title: __('VM Selection'),
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'filter_type',
          name: 'filter_type',
          label: __('Filter Type'),
          isRequired: true,
          includeEmpty: true,
          options: filterTypes,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          onChange: (filterTypeId) => setState((state) => ({ ...state, filterTypeId })),
        },
        {
          component: componentTypes.SELECT,
          id: 'filter_value',
          name: 'filter_value',
          key: `filter_value-${filterTypeId}`,
          labelText: __('Filter Value'),
          isRequired: true,
          isSearchable: true,
          validate: [{
            type: validatorTypes.REQUIRED,
            message: __('Required'),
          }],
          options: filterTypeId ? buildFilterValueOptions(data.sb_rsop[filterTypeId]) : [], // TODO: See if this has an  API call as well
          condition: {
            when: 'filter_type',
            isNotEmpty: true,
          },
        },
      ],
    },
  ],
});

export default createSchema;
