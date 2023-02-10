import { componentTypes, validatorTypes } from '@@ddf';
import { parseCondition } from '@data-driven-forms/react-form-renderer';
import validateName from '../../helpers/validate-names';

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
const equalsUnsorted = (arr1, arr2) => arr1.length === arr2.length
  && arr2.every((arr2Item) => arr1.includes(arr2Item))
  && arr1.every((arr1Item) => arr2.includes(arr1Item));

const filterByCapabilities = (filterArray, modelToFilter, isMulti) =>
  API.get(`/api/${modelToFilter}?expand=resources&attributes=id,name,capabilities`)
  .then(({ resources }) => {
    const valueArray = [];
    resources.forEach((resource) => {
      const capsToFilter = resource["capabilities"].map(({ uuid }) => uuid);
      if (equalsUnsorted(filterArray, capsToFilter)) {
        valueArray.push(resource);
      }
    });

    const options = valueArray.map(({ name, id }) => ({ label: name, value: id }))

    if (options.length === 0 ) {
      options.unshift({label: sprintf(__('No %s with selected capabilities.'), modelToFilter), value: '-1'});
    }
    if (!isMulti) {
      options.unshift({label: `<${__('Choose')}>`, value: '-2'});
    }

    return options;
  });

const createSchema = (fields, edit, ems, loadSchema, emptySchema) => {
  const idx = fields.findIndex((field) => field.name === 'volume_type');
  const supports = edit ? 'supports_cloud_volume' : 'supports_cloud_volume_create';

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
            pattern: '^[a-zA-Z0-9\-_. ]*$',
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
        condition: { when: 'required_capabilities', isNotEmpty: true },
        fields: [
          {
            component: 'enhanced-select',
            name: 'storage_service_id',
            id: 'storage_service_id',
            label: __('Storage Service'),
            condition: { when: 'mode', is: 'Basic' },
            onInputChange: () => null,
            isRequired: true,
            validate: [
              { type: validatorTypes.REQUIRED },
              { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: 'Required' },
            ],
            resolveProps: (_props, _field, { getState }) => {
              const capabilityValues = getState().values.required_capabilities.map(({ value }) => value);
              return {
                key: JSON.stringify(capabilityValues),
                loadOptions: () => filterByCapabilities(capabilityValues, 'storage_services', false),
              };
            },
          },
          {
            component: 'enhanced-select',
            name: 'storage_resource_id',
            id: 'storage_resource_id',
            label: __('Storage Resource'),
            condition: { when: 'mode', is: 'Advanced' },
            onInputChange: () => null,
            isRequired: true,
            validate: [
              { type: validatorTypes.REQUIRED },
              { type: validatorTypes.PATTERN, pattern: '^(?!-)', message: 'Required' }
            ],
            isMulti: true,
            resolveProps: (_props, _field, { getState }) => {
              const capabilityValues = getState().values.required_capabilities.map(({ value }) => value);
              return {
                key: JSON.stringify(capabilityValues),
                loadOptions: () => filterByCapabilities(capabilityValues, 'storage_resources', true),
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
              async (value) => validateName("storage_services", value)
            ],
          },
        ]
      },
    ]
  });
};

export default createSchema;
