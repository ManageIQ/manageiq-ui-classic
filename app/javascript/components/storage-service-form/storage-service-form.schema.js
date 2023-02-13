import { componentTypes, validatorTypes } from '@@ddf';
import validateName from '../../helpers/storage_manager/validate-names';
import loadProviderCapabilities from '../../helpers/storage_manager/load-provider-capabilities';

const loadProviders = () =>
  API.get(
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage'
    + '&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

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
        label: __('Storage Manager'),
        placeholder: __('<Choose>'),
        onChange: (value) => {
          emsId = value;
          return setState({ ...state, ems_id: value });
        },
        loadOptions: loadProviders,
        isDisabled: edit || ems,
        isRequired: true,
        includeEmpty: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Name:'),
        isRequired: true,
        validate: [
          { type: validatorTypes.REQUIRED },
          async(value) => validateName('storage_services', value, edit),
        ],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'description',
        id: 'description',
        label: __('Description:'),
        isRequired: false,
      },
      {
        component: componentTypes.SELECT,
        name: 'required_capabilities',
        id: 'required_capabilities',
        label: __('Required Capabilities'),
        placeholder: __('<Choose>'),
        loadOptions: () => (emsId ? loadProviderCapabilities(emsId) : Promise.resolve([])),
        isDisabled: edit,
        isRequired: true,
        isMulti: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        condition: { when: 'ems_id', isNotEmpty: true },
      },
    ],
  });
};

export default createSchema;
