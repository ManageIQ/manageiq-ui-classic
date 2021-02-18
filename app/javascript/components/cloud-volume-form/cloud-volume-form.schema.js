import { componentTypes, validatorTypes } from '@@ddf';
import { parseCondition } from '@data-driven-forms/react-form-renderer';

const createSchema = (fields, edit, ems, loadSchema) => {
  const idx = fields.findIndex((field) => field.name === 'volume_type');
  const supports = edit ? 'supports_cloud_volume' : 'supports_cloud_volume_create';

  return ({
    fields: [
      {
        component: componentTypes.SELECT,
        name: 'ems_id',
        id: 'ems_id',
        label: __('Storage Manager'),
        placeholder: __('<Choose>'),
        onChange: (value) => API.options(`/api/cloud_volumes?ems_id=${value}`).then(loadSchema()),
        loadOptions: () => API.get(`/api/providers?expand=resources&attributes=id,name,${supports}&filter[]=${supports}=true`).then(({ resources }) =>
          resources.map(({ id, name }) => ({ value: id, label: name }))),
        isDisabled: edit || ems,
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        includeEmpty: true,
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'name',
        id: 'name',
        label: __('Volume Name'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
      },
      {
        component: componentTypes.TEXT_FIELD,
        name: 'edit',
        id: 'edit',
        label: '',
        type: 'hidden',
        hideField: true,
        initialValue: edit,
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
