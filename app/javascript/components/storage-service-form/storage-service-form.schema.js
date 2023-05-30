import { componentTypes, validatorTypes } from '@@ddf';
import { parseCondition } from '@data-driven-forms/react-form-renderer';
import validateName from '../../helpers/storage_manager/validate-names';
import filterResourcesByCapabilities from '../../helpers/storage_manager/filter-resources-by-capabilities';

const changeValue = (value, loadSchema, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    miqSparkleOn();
    API.options(`/api/storage_services?ems_id=${value}`).then(loadSchema()).then(miqSparkleOff);
  }
};

const storageManagers = (supports) =>
  API.get(`/api/providers?expand=resources&attributes=id,name,${supports}&filter[]=${supports}=true`)
    .then(({ resources }) => {
      const storageManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
      storageManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
      return storageManagersOptions;
    });

const getProviderCapabilities = async(providerId) => API.get(`/api/providers/${providerId}?attributes=capabilities`)
  .then((result) => result.capabilities);

const filterSelectedResources = (selectedResources, compliantResources) => {
  const compliantResourcesIds = compliantResources.map((compliantResource) => compliantResource.value);
  return selectedResources.filter((selectedResource) => compliantResourcesIds.includes(selectedResource.value));
};

const createSchema = (fields, edit, ems, loadSchema, emptySchema) => {
  const idx = fields.findIndex((field) => field.name === 'required_capabilities');
  const supports = edit ? 'supports_storage_services' : 'supports_storage_service_create';
  let providerCapabilities;

  return ({
    fields: [
      {
        component: componentTypes.SELECT,
        name: 'ems_id',
        id: 'ems_id',
        label: __('Storage Manager'),
        onChange: (value) => changeValue(value, loadSchema, emptySchema),
        loadOptions: () => storageManagers(supports),
        isDisabled: edit || ems,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Service Name'),
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
          },
          {
            type: 'pattern',
            pattern: '^[a-zA-Z0-9-_. :]*$',
            message: __('The name can contain letters, numbers, spaces, periods, colons, dashes and underscores'),
          },
          {
            type: 'pattern',
            pattern: '^[^ ]+( +[^ ]+)*$',
            message: __('The name must not begin or end with a space'),
          },
          {
            type: 'pattern',
            pattern: '^[a-zA-Z_]',
            message: __('The name must begin with a letter or an underscore'),
          },
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
      ...(idx === -1 ? fields : [
        ...fields.slice(0, idx),
        {
          ...fields[idx],
          resolveProps: ({ options }, _input, { getState }) => ({
            options: options.filter(({ condition }) => !condition || parseCondition(condition, getState().values).result),
          }),
        },
        ...fields.slice(idx + 1),
      ]),
      {
        component: 'compliance-button',
        name: 'Compliance',
        id: 'compliant-resources-button',
        skipSubmit: true,
        hideField: !edit,
        condition: { when: 'compression', isNotEmpty: true },
        fields: [
          {
            component: componentTypes.SWITCH,
            name: 'Check Compliance',
            hideField: true,
          },
        ],
      },
      {
        component: 'enhanced-select',
        name: 'storage_resource_id',
        id: 'storage_resource_id',
        label: __('Storage Resources'),
        condition: { when: 'compression', isNotEmpty: true },
        onInputChange: () => null,
        isRequired: true,
        helperText: __('Select storage resources to attach to the service. Volumes for this service will be created on these resources.'),
        validate: [
          { type: validatorTypes.REQUIRED },
          { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: __('Required') },
        ],
        isMulti: true,
        resolveProps: (_props, _field, { getState }) => {
          const stateValues = getState().values;
          const emsId = stateValues.ems_id;
          const selectedResources = stateValues.storage_resource_id ? stateValues.storage_resource_id : [];
          const capabilityValues = [];

          const capabilityNames = fields.find((object) => object.id === 'required_capabilities')
            .fields.map((capability) => capability.id);
          capabilityNames.forEach((capabilityName) => capabilityValues.push(stateValues[capabilityName]));

          return {
            key: JSON.stringify(capabilityValues),
            loadOptions: async() => {
              providerCapabilities = await getProviderCapabilities(emsId);
              const filteredResources = await filterResourcesByCapabilities(capabilityValues, providerCapabilities);
              stateValues.storage_resource_id = filterSelectedResources(selectedResources, filteredResources);

              return filteredResources;
            },
          };
        },
      },
    ],
  });
};

export default createSchema;
