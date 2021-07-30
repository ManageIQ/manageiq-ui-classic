import { componentTypes, validatorTypes } from '@@ddf';

const providersUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_host_aggregate&filter[]=supports_create_host_aggregate=true';
const loadProviders = () => API.get(providersUrl).then(({ resources }) => resources.map(({ id, name }) => ({ label: name, value: id })));

const availabilityZonesUrl = (emsId) => `/api/availability_zones?expand=resources&attributes=name&filter[]=ems_id=${emsId}`;
const loadAvailabilityZones = (emsId) => API.get(availabilityZonesUrl(emsId)).then(({ resources }) => resources.map(({
  id, name,
}) => ({
  label: name,
  value: id,
})));

const createSchema = (edit, emsId, setState) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Host Aggregate Name'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      maxLength: 128,
    },
    ...(!edit ? [
      {
        component: componentTypes.SELECT,
        id: 'emd_id',
        name: 'ems_id',
        label: __('Provider'),
        validate: [{ type: validatorTypes.REQUIRED }],
        onChange: (emsId) => setState((state) => ({ ...state, emsId })),
        isRequired: true,
        includeEmpty: true,
        loadOptions: loadProviders,
      },
      {
        component: componentTypes.SELECT,
        id: 'availability_zone',
        name: 'availability_zone',
        key: `availability_zone-${emsId}`,
        label: __('Availability Zone'),
        loadOptions: () => (emsId ? loadAvailabilityZones(emsId) : Promise.resolve([])), // here emdId is an object hence why availability zones not working
        includeEmpty: true,
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
    ] : []),
  ],
});

export default createSchema;
