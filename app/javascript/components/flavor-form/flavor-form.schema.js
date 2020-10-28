import { componentTypes, validatorTypes } from '@@ddf';

const providerUrl = '/api/providers?expand=resources&attributes=id,name,supports_create_flavor&filter[]=supports_create_flavor=true';

const loadCloudTenants = (emsId) => API.get(`/api/providers/${emsId}/cloud_tenants?expand=resources&attributes=id,name`)
  .then(({ resources }) => resources.map(({ id, name }) => ({ label: name, value: id })));

const commonValidators = (min) => [
  {
    type: validatorTypes.REQUIRED,
  },
  {
    type: validatorTypes.PATTERN,
    pattern: '^[-+]?[0-9]\\d*$',
    message: __('Must be an integer'),
  },
  {
    type: validatorTypes.MIN_NUMBER_VALUE,
    value: 1,
    message: sprintf(__('Must be greater than or equal to %d'), min),
  },
];

const createSchema = (emsId, setState) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'emsId',
      name: 'emsId',
      label: __('Provider'),
      isRequired: true,
      isSearchable: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      loadOptions: () => API.get(providerUrl).then(({ resources }) => resources.map(({ id, name }) => ({ value: id, label: name }))),
      onChange: (value) => setState((state) => ({ ...state, emsId: value })),
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      validate: [{ type: validatorTypes.REQUIRED }],
      label: __('Name'),
      isRequired: true,
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'ram',
      name: 'ram',
      label: __('RAM size (in MB)'),
      dataType: 'integer',
      type: 'number',
      isRequired: true,
      validate: commonValidators(1),
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'vcpus',
      name: 'vcpus',
      label: __('VCPUs'),
      dataType: 'integer',
      type: 'number',
      isRequired: true,
      validate: commonValidators(1),
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'disk',
      name: 'disk',
      label: __('Disk size in GB'),
      dataType: 'integer',
      type: 'number',
      isRequired: true,
      validate: commonValidators(1),
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'swap',
      name: 'swap',
      label: __('Swap size (in MB)'),
      dataType: 'integer',
      type: 'number',
      isRequired: true,
      validate: commonValidators(0),
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'rxtx_factor',
      name: 'rxtx_factor',
      label: __('RXTX factor'),
      type: 'number',
      isRequired: true,
      initialValue: 1.0,
      validate: commonValidators(0),
    },
    {
      component: componentTypes.SWITCH,
      id: 'is_public',
      name: 'is_public',
      label: __('Public'),
      onText: __('Yes'),
      offText: __('No'),
      initialValue: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'cloud_tenant_refs',
      name: 'cloud_tenant_refs',
      key: `cloud_tenant_refs-${emsId}`,
      label: __('Cloud Tenants'),
      loadOptions: () => (emsId ? loadCloudTenants(emsId) : Promise.resolve([])),
      placeholder: __('Nothing selected'),
      isMulti: true,
      isSearchable: true,
      isClearable: true,
      condition: {
        and: [
          {
            when: 'is_public',
            is: false,
          },
          {
            when: 'emsId',
            isNotEmpty: true,
          },
        ],
      },
    },
  ],
});

export default createSchema;
