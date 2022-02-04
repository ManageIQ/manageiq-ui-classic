import { componentTypes, validatorTypes } from '@@ddf';
import { parseCondition } from '@data-driven-forms/react-form-renderer';

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
    let storageManagersOptions = [];
    storageManagersOptions = resources.map(({ id, name }) => ({ label: name, value: id }));
    storageManagersOptions.unshift({ label: `<${__('Choose')}>`, value: '-1' });
    return storageManagersOptions;
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
        validate: [{ type: validatorTypes.REQUIRED }],
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
    ],
  });
};

export default createSchema;
