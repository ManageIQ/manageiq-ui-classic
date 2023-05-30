import { componentTypes, validatorTypes } from '@@ddf';
import validateName from '../../helpers/storage_manager/validate-names';

export const portTypes = [
  { label: __('ISCSI'), value: 'ISCSI' },
  { label: __('FC'), value: 'FC' },
  { label: __('NVMe'), value: 'NVMeFC' },
];

const loadProviders = () =>
  API.get(
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage='
    + 'true&filter[]=supports_create_host_initiator_group=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const loadStorages = (id) => API.get(`/api/providers/${id}?attributes=type,physical_storages`)
  // eslint-disable-next-line camelcase
  .then(({ physical_storages }) => physical_storages.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

// const createSchema = (state, setState, ems, initialValues, storageId, setStorageId) => {
const createSchema = (edit, ems, initialValues, state, setState) => {
  let emsId = state.ems_id;
  if (initialValues && initialValues.ems_id) {
    emsId = initialValues.ems_id;
  }
  return ({
    fields: [
      {
        component: componentTypes.SELECT,
        name: 'ems_id',
        id: 'ems_id',
        key: `${emsId}`,
        label: __('Provider:'),
        placeholder: __('<Choose>'),
        isRequired: true,
        isDisabled: ems,
        loadOptions: loadProviders,
        onChange: (value) => setState({ ...state, ems_id: value }),
        validate: [{ type: validatorTypes.REQUIRED }],
        includeEmpty: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name:'),
        isRequired: true,
        validate: [
          { type: validatorTypes.REQUIRED },
          async(value) => validateName('host_initiator_groups', value, false),
        ],
      },
      {
        component: componentTypes.SELECT,
        name: 'physical_storage_id',
        id: 'physical_storage_id',
        label: __('Physical Storage:'),
        isRequired: true,
        placeholder: __('<Choose>'),
        includeEmpty: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        loadOptions: () => (emsId ? loadStorages(emsId) : Promise.resolve([])),
        key: `physical_storage_id-${emsId}`,
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
    ],
  });
};

export default createSchema;
