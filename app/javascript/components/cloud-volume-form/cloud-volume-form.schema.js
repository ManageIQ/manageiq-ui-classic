import { componentTypes, validatorTypes } from '@@ddf';
import { parseCondition } from '@data-driven-forms/react-form-renderer';
import validateName from '../../helpers/storage_manager/validate-names';
import filterResourcesByCapabilities from '../../helpers/storage_manager/filter-resources-by-capabilities';
import filterServicesByCapabilities from '../../helpers/storage_manager/filter-service-by-capabilities';
import { getProviderCapabilities } from '../../helpers/storage_manager/filter-by-capabilities-utils';

const changeValue = (value, loadSchema, emptySchema) => {
  if (value === '-1') {
    emptySchema();
  } else {
    miqSparkleOn();
    API.options(`/api/cloud_volumes?ems_id=${value}`).then(loadSchema()).then(miqSparkleOff);
  }
};

const storageManagers = (supports) =>
  API.get(`/api/providers?expand=resources&attributes=id,name,${supports}&filter[]=${supports}=true`)
    .then(({ resources }) => {
      const storageManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
      storageManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
      return storageManagersOptions;
    });

// storage manager functions:

const validateServiceHasResources = (serviceId) =>
  API.get(`/api/storage_services/${serviceId}?attributes=name,storage_resources`)
    .then((response) => (response.storage_resources.length === 0
      ? sprintf(__('Storage service "%s" has no attached storage resources'), response.name)
      : undefined));

const createSchema = (fields, edit, ems, loadSchema, emptySchema) => {
  const idx = fields.findIndex((field) => field.name === 'volume_type');
  const supports = edit ? 'supports_cloud_volume' : 'supports_cloud_volume_create';
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
        label: __('Volume Name'),
        isRequired: true,
        validate: [
          {
            type: validatorTypes.REQUIRED,
          },
          {
            type: 'pattern',
            pattern: '^[a-zA-Z0-9-_. ]*$',
            message: __('The name can contain letters, numbers, spaces, periods, dashes and underscores'),
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
          async(value) => validateName('cloud_volumes', value, edit),
        ],
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
        component: componentTypes.SUB_FORM,
        name: 'resource_type_selection',
        id: 'resource_type_selection',
        condition: { when: 'compression', isNotEmpty: true },
        fields: [
          {
            component: 'enhanced-select',
            name: 'storage_service_id',
            id: 'storage_service_id',
            label: __('Storage Service'),
            condition: { and: [{ when: 'mode', is: 'Basic' }, { when: 'ems_id', isNotEmpty: true }] },
            onInputChange: () => null,
            isRequired: true,
            validate: [
              { type: validatorTypes.REQUIRED },
              { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: 'Required' },
              async(value) => validateServiceHasResources(value),
            ],
            resolveProps: (_props, _field, { getState }) => {
              const capabilityValues = [getState().values.compression, getState().values.thin_provision];
              const emsId = getState().values.ems_id;
              return {
                key: JSON.stringify(capabilityValues),
                loadOptions: async() => {
                  providerCapabilities = await getProviderCapabilities(emsId);
                  return filterServicesByCapabilities(capabilityValues, providerCapabilities);
                },
              };
            },
          },
          {
            component: 'enhanced-select',
            name: 'storage_resource_id',
            id: 'storage_resource_id',
            label: __('Storage Resource (if no option appears then no storage resource with selected capabilities was found)'),
            condition: { when: 'mode', is: 'Advanced' },
            onInputChange: () => null,
            isRequired: true,
            validate: [
              { type: validatorTypes.REQUIRED },
              { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: 'Required' },
            ],
            isMulti: true,
            resolveProps: (_props, _field, { getState }) => {
              const capabilityValues = [getState().values.compression, getState().values.thin_provision];
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
          {
            component: componentTypes.TEXT_FIELD,
            name: 'new_service_name',
            id: 'new_service_name',
            label: __('Service Name'),
            condition: { when: 'mode', is: 'Advanced' },
            isRequired: true,
            validate: [
              { type: validatorTypes.REQUIRED },
              async(value) => validateName('storage_services', value),
            ],
          },
        ],
      },
    ],
  });
};

export default createSchema;
