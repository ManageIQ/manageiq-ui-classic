import { componentTypes, validatorTypes } from '@@ddf';
import validateName from '../../helpers/storage_manager/validate-names';

export const portTypes = [
  { label: __('ISCSI'), value: 'ISCSI' },
  { label: __('FC'), value: 'FC' },
  { label: __('NVMe'), value: 'NVMeFC' },
];

const loadProviders = () =>
  API.get(
    // eslint-disable-next-line max-len
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_host_initiator=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const loadStorages = (id) => API.get(`/api/providers/${id}?attributes=type,physical_storages`)
  // eslint-disable-next-line camelcase
  .then(({ physical_storages }) => physical_storages.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

const loadGroups = (id) => API.get(`/api/physical_storages/${id}?attributes=host_initiator_groups`)
  // eslint-disable-next-line camelcase
  .then(({ host_initiator_groups }) => {
    const groupOptions = host_initiator_groups.map(({ name }) => ({ label: name, value: name }));
    groupOptions.unshift(
      { label: `<${__('Choose')}>`, value: '-1' },
      { label: `<${__('None')}>`, value: 'none' }
    );
    return groupOptions;
  });

const loadWwpns = (id) => API.get(`/api/physical_storages/${id}?attributes=wwpn_candidates`)
  // eslint-disable-next-line camelcase
  .then(({ wwpn_candidates }) => wwpn_candidates.map(({ candidate }) =>
    ({
      value: candidate,
      label: candidate,
    })));

const validateAddress = async(addressType, address) => {
  const addresses = [];
  await API.get('/api/host_initiators?expand=resources&attributes=san_addresses')
    .then(({ resources }) => resources.map((resource) => resource.san_addresses))
    .then((addressesArrays) => addressesArrays.map((addressesArray) => addressesArray.map((address) => address[addressType])))
    .then((results) => (results.forEach((result) => addresses.push(...result))));

  return addresses.includes(address) ? sprintf(__('Address %s is already in use'), address) : undefined;
};

const createSchema = (state, setState, ems, initialValues, storageId, setStorageId) => {
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
          {
            type: validatorTypes.REQUIRED,
          },
          {
            type: 'max-length',
            threshold: 15,
            message: __('The name should have up to 15 characters.'),
          },
          async(value) => validateName('host_initiators', value, false),
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
        onChange: (value) => setStorageId(value),
        key: `physical_storage_id-${emsId}`,
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
        placeholder: __('<Choose>'),
        options: portTypes,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        includeEmpty: true,
        condition: { when: 'physical_storage_id', isNotEmpty: true },
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'iqn',
        id: 'iqn',
        label: __('IQN:'),
        fieldKey: 'field_array',
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            label: __('IQN'),
            isRequired: true,
            validate: [
              {
                type: validatorTypes.REQUIRED,
              },
              {
                type: 'pattern',
                pattern: "iqn\\.(\\d{4}-\\d{2})\\.([^:]+)(:)([^,:\\s']+)",
                message: __('The IQN should have the format: iqn.yyyy-mm.naming-authority:unique name'),
              },
              {
                type: 'pattern',
                pattern: '^[a-z0-9:.-]*$',
                message: __('The IQN should contain only lower-case letters (a to z), digits (0 to 9), hyphens (-), '
                  + 'periods (.) or colons (:)'),
              },
              {
                type: 'max-length',
                threshold: 223,
                message: __('The IQN should have up to 223 characters.'),
              },
              async(value) => validateAddress('iqn', value),
            ],
          },
        ],
        condition: {
          when: 'port_type',
          is: 'ISCSI',
        },
      },
      {
        component: componentTypes.CHECKBOX,
        id: 'chap_authentication',
        name: 'chap_authentication',
        label: __('CHAP Authentication'),
        condition: {
          when: 'port_type',
          is: 'ISCSI',
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'chap_name',
        id: 'chap_name',
        label: __('CHAP Username:'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          and: [{
            when: 'port_type',
            is: 'ISCSI',
          }, { when: 'chap_authentication', is: true }],
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'chap_secret',
        id: 'chap_secret',
        validate: [{ type: validatorTypes.REQUIRED }],
        label: __('CHAP Secret:'),
        isRequired: true,
        condition: {
          and: [{
            when: 'port_type',
            is: 'ISCSI',
          }, { when: 'chap_authentication', is: true }],
        },
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'wwpn',
        id: 'wwpn',
        label: __('WWPNs detected by the storage'),
        fieldKey: 'field_array',
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [
          {
            component: componentTypes.SELECT,
            placeholder: __('<Choose>'),
            validate: [{ type: validatorTypes.REQUIRED }],
            loadOptions: () => (storageId ? loadWwpns(storageId) : Promise.resolve([])),
            isSearchable: true,
            simpleValue: true,
          },
        ],
        condition: {
          or: [{ when: 'port_type', is: 'FC' }, { when: 'port_type', is: 'NVMeFC' }],
        },
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'custom_wwpn',
        id: 'custom_wwpn',
        label: __('Custom manually entered WWPNs'),
        fieldKey: 'field_array',
        buttonLabels: {
          add: __('Add'),
          remove: __('Remove'),
        },
        AddButtonProps: {
          size: 'small',
        },
        RemoveButtonProps: {
          size: 'small',
        },
        fields: [
          {
            component: componentTypes.TEXT_FIELD,
            label: __('Custom WWPN'),
            isRequired: true,
            validate: [
              {
                type: validatorTypes.REQUIRED,
              },
              {
                type: 'exact-length',
                threshold: 16,
                message: __('The length of the WWPN should be exactly 16 characters.'),
              },
              {
                type: 'pattern',
                pattern: '^[0-9A-Fa-f]+$',
                message: __('The WWPN should be a hexadecimal expression (0-9, A-F)'),
              },
              async(value) => validateAddress('wwpn', value),
            ],
          },
        ],
        condition: {
          or: [{ when: 'port_type', is: 'FC' }, { when: 'port_type', is: 'NVMeFC' }],
        },
      },
      {
        component: componentTypes.SELECT,
        id: 'host_initiator_group',
        name: 'host_initiator_group',
        label: __('Host Initiator Group:'),
        isRequired: true,
        validate: [
          { type: validatorTypes.REQUIRED },
          { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: __('Required') },
        ],
        loadOptions: () => (storageId ? loadGroups(storageId) : Promise.resolve([])),
        condition: { and: [{ when: 'physical_storage_id', isNotEmpty: true }, { when: 'port_type', isNotEmpty: true }] },
      },
    ],
  });
};

export default createSchema;
