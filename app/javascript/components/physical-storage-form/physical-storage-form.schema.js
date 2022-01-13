import { componentTypes, validatorTypes } from '@@ddf';

const loadProviders = () =>
  API.get(
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const loadFamilies = (id) => API.get(`/api/providers/${id}?attributes=type,physical_storage_families`)
  // eslint-disable-next-line camelcase
  .then(({ physical_storage_families }) => physical_storage_families.map(({ name, id }) => ({
    label: name,
    value: id,
  })));

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
        key: `${emsId}`,
        id: 'ems_id',
        label: __('Provider:'),
        isRequired: true,
        isDisabled: edit || ems,
        loadOptions: loadProviders,
        includeEmpty: true,
        onChange: (value) => setState({ ...state, ems_id: value }),
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
        name: 'physical_storage_family_id',
        id: 'physical_storage_family_id',
        label: __('System Type:'),
        isRequired: true,
        isDisabled: edit,
        validate: [{ type: validatorTypes.REQUIRED }],
        loadOptions: () => (emsId ? loadFamilies(emsId) : Promise.resolve([])),
        includeEmpty: true,
        key: `physical_storage_family_id-${emsId}`,
        condition: {
          when: 'ems_id',
          isNotEmpty: true,
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'edit',
        id: 'edit',
        label: 'edit',
        hideField: true,
        initialValue: '',
      },
      {
        component: componentTypes.CHECKBOX,
        id: 'edit_authentication',
        name: 'edit_authentication',
        label: __('Edit Authentication'),
        initialValue: false,
        condition: {
          when: 'edit',
          is: 'yes',
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'management_ip',
        id: 'management_ip',
        label: __('Management IP:'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          or: [{ when: 'edit_authentication', is: true }, { when: 'edit', is: '' }],
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'user',
        id: 'user',
        label: __('User:'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          or: [{ when: 'edit_authentication', is: true }, { when: 'edit', is: '' }],
        },
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'password',
        type: 'password',
        id: 'physical_storage_password',
        label: __('Password:'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: {
          or: [{ when: 'edit_authentication', is: true }, { when: 'edit', is: '' }],
        },
      },
    ],
  });
};

export default createSchema;
