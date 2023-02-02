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

const storageManagers = (supports) => API.get(`/api/providers?expand=resources&attributes=id,name,${supports}&filter[]=${supports}=true`)
  .then(({ resources }) => {
    const storageManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
    storageManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
    return storageManagersOptions;
  });

// storage manager functions:
const equalsUnsorted = (arr1, arr2) => arr1.length === arr2.length
  && arr2.every(arr2Item => arr1.includes(arr2Item))
  && arr1.every(arr1Item => arr2.includes(arr1Item));

const filterByCapabilities = (filterArray, modelToFilter) => API.get(`/api/${modelToFilter}?expand=resources&attributes=id,name,capabilities`)
  .then(({ resources }) => {
    const valueArray = [];
    resources.forEach((resource) => {
      const capsToFilter = resource["capabilities"].map(({ uuid }) => uuid);
      if (equalsUnsorted(filterArray, capsToFilter)) {
        valueArray.push(resource);
      }
    });
    if (valueArray.length === 0 && modelToFilter !== 'storage_resources') {
      return [{label: `no ${modelToFilter} with selected capabilities`, value: -1}]
    }
    return valueArray.map(({ name, id }) => ({ label: name, value: id }));
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
          { type: validatorTypes.REQUIRED },
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
            validate: [{ type: validatorTypes.REQUIRED }],
            resolveProps: (_props, _field, { getState }) => {
              const capabilityValues = getState().values.required_capabilities.map(({ value }) => value);
              return {
                key: JSON.stringify(capabilityValues),
                loadOptions: () => filterByCapabilities(capabilityValues, 'storage_services'),
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
            validate: [{ type: validatorTypes.REQUIRED }],
            isMulti: true,
            resolveProps: (_props, _field, { getState }) => {
              const capabilityValues = getState().values.required_capabilities.map(({ value }) => value);
              return {
                key: JSON.stringify(capabilityValues),
                loadOptions: () => filterByCapabilities(capabilityValues, 'storage_resources'),
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
