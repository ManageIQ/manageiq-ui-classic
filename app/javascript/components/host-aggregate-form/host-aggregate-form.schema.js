import { componentTypes, validatorTypes } from '@@ddf';

const providersUrl = '/api/providers?expand=resources&attributes=id,name,availability_zone,supports_create_host_aggregate&filter[]=supports_create_host_aggregate=true';
const availabilityZonesUrl = (emsId) => `/api/availability_zones?expand=resources&attributes=name&filter[]=ems_id=${emsId}`;
const loadAvailabilityZones = (emsId) => API.get(availabilityZonesUrl(emsId)).then(({ resources }) => resources.map(({
  name,
}) => ({
  label: name,
  value: name,
})));

const createSchema = (edit, emsId, setState) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      id: 'name',
      label: __('Name'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    ...(!edit ? [
      {
        component: componentTypes.SELECT,
        name: 'ems_id',
        id: 'emd_id',
        label: __('Provider'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        onChange: (emsId) => setState((state) => ({ ...state, emsId })),
        loadOptions: () => API.get(providersUrl).then(({ resources }) => resources.map(({ ems_ref, name }) => ({ label: name, value: ems_ref }))),
      },
      {
        component: componentTypes.SELECT,
        name: 'availability_zone',
        id: 'availability_zone',
        key: `availability_zone-${emsId}`,
        label: __('Availability Zone'),
        loadOptions: () => (emsId ? loadAvailabilityZones(emsId) : Promise.resolve([])),
        isClearable: true,
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
    ] : []),
  ],
});

export default createSchema;
