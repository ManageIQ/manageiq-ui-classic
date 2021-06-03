import { componentTypes, validatorTypes } from '@@ddf';

export const portTypes = [
  { label: __('ISCSI'), value: 'ISCSI' },
  { label: __('FC'), value: 'FC' },
  { label: __('NVMe'), value: 'NVMeFC' },
];

const loadProviders = () =>
  API.get(
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const loadStorages = (id) => API.get(`/api/providers/${id}?attributes=type,physical_storages`)
  // eslint-disable-next-line camelcase
  .then(({ physical_storages }) => physical_storages.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const createSchema = (emsId, setEmsId) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      name: 'ems_id',
      key: 'ems_id',
      id: 'ems_id',
      label: __('Provider:'),
      isRequired: true,
      loadOptions: loadProviders,
      onChange: (value) => setEmsId(value),
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      id: 'name',
      label: __('Name:'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.SELECT,
      name: 'physical_storage_id',
      id: 'physical_storage_id',
      label: __('Physical Storage:'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      loadOptions: () => (emsId ? loadStorages(emsId) : Promise.resolve([])),
      key: emsId,
      condition: {
        when: 'ems_id',
        isNotEmpty: true,
      },
    },
    {
      component: componentTypes.SELECT,
      id: 'port_type',
      name: 'port_type',
      label: __('Port type:'),
      placeholder: __('Nothing selected'),
      options: portTypes,
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'iqn',
      id: 'iqn',
      label: __('iqn:'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      condition: {
        when: 'port_type',
        is: 'ISCSI',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'chap_name',
      id: 'chap_name',
      label: __('chap_name:'),
      isRequired: false,
      condition: {
        when: 'port_type',
        is: 'ISCSI',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'chap_secret',
      id: 'chap_secret',
      label: __('chap_secret:'),
      isRequired: false,
      condition: {
        when: 'port_type',
        is: 'ISCSI',
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'wwpn',
      id: 'wwpn',
      label: __('wwpn:'),
      isRequired: true,
      validate: [{ type: validatorTypes.REQUIRED }],
      condition: {
        or: [{ when: 'port_type', is: 'FC' }, { when: 'port_type', is: 'NVMeFC' }],
      },
    },
  ],
});

export default createSchema;
