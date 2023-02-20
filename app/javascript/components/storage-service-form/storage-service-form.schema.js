import { componentTypes, validatorTypes } from '@@ddf';
import validateName from '../../helpers/storage_manager/validate-names';
import { loadProviderCapabilities } from '../../helpers/storage_manager/load-provider-capabilities';
import filterResourcesByCapabilities from '../../helpers/storage_manager/filter-resources-by-capabilities';

const loadProviders = () =>
  API.get(
    '/api/providers?expand=resources&attributes=id,name,supports_block_storage'
    + '&filter[]=supports_block_storage=true&filter[]=supports_add_storage=true',
  ).then(({ resources }) =>
    resources.map(({ id, name }) => ({ value: id, label: name })));

const getProviderCapabilities = async(providerId) => API.get(`/api/providers/${providerId}?attributes=capabilities`)
  .then((result) => result.capabilities);

const createSchema = (edit, ems, initialValues, state, setState) => {
  let providerCapabilities;
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
      {
        component: 'enhanced-select',
        name: 'storage_resource_id',
        id: 'storage_resource_id',
        label: __('Storage Resources'),
        condition: { when: 'required_capabilities', isNotEmpty: true },
        onInputChange: () => null,
        isRequired: true,
        helperText: __('Select storage resources to attach to the new service. Volumes for this service will be created on these resources.'),
        validate: [
          { type: validatorTypes.REQUIRED },
          { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: __('Required') },
        ],
        isMulti: true,
        resolveProps: (_props, _field, { getState }) => {
          const capabilityValues = getState().values.required_capabilities.map(({ value }) => value);
          const emsId = getState().values.ems_id;
          return {
            key: JSON.stringify(capabilityValues),
            loadOptions: async() => {
              providerCapabilities = await getProviderCapabilities(emsId);
              return filterResourcesByCapabilities(capabilityValues, providerCapabilities);
            },
          };
        },
      },
    ],
  });
};

export default createSchema;
