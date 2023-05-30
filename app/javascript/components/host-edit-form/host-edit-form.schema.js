import { componentTypes, validatorTypes } from '@@ddf';

// Called only when multiple hosts are selected
const loadHosts = (ids) =>
  API.get(`/api/hosts?expand=resources&attributes=id,name&filter[]=id=[${ids}]`)
    .then(({ resources }) => {
      const temp = resources.map(({ id, name }) => ({ value: id, label: name }));
      temp.unshift({ label: `<${__('Choose')}>`, value: '-1' });
      return temp;
    });

const changeValue = (value, getHostData, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    getHostData(value);
  }
};

function createSchema(ids, endpointFields, emptySchema, getHostData) {
  const fields = [
    ...(ids.length <= 1
      ? [{
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name:'),
        isDisabled: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'hostname',
        id: 'hostname',
        label: __('Hostname (or IPv4 or IPv6 address:'),
        isDisabled: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'custom_identifier',
        id: 'custom_identifier',
        label: __('Custom Identifier:'),
        isDisabled: true,
      }] : [{
        component: componentTypes.SELECT,
        name: 'host_validate_against',
        id: 'host_validate_against',
        label: __('Select a Host to validate against'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        loadOptions: () => loadHosts(ids),
        onChange: (value) => changeValue(value, getHostData, emptySchema),
      }]),
    ...(endpointFields || []),
  ];
  return { fields };
}

export default createSchema;
