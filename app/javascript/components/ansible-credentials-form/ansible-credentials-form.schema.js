import { componentTypes, validatorTypes } from '@@ddf';

const normalize = (fields, edit) => fields.map(({ component, label, helperText, fields, ...field }) => ({
  ...field,
  component,
  label: __(label),
  helperText: __(helperText),
  ...(component === 'password-field' && { edit }),
  ...(fields && { fields: normalize(fields, edit) }),
}));

const createSchema = (fields, promise, edit, loadSchema) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'manager_resource',
      type: 'hidden',
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'name',
      name: 'name',
      label: __('Name'),
      maxLength: 128,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: componentTypes.SELECT,
      id: 'type',
      name: 'type',
      label: __('Credential type'),
      placeholder: __('<Choose>'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      isDisabled: edit,
      onChange: value => promise.then(loadSchema(value)),
      loadOptions: () =>
        promise.then(
          ({
            data: {
              credential_types: { embedded_ansible_credential_types },
            },
          }) =>
            Object.keys(embedded_ansible_credential_types).map(key => ({
              value: key,
              label: __(embedded_ansible_credential_types[key].label),
            })),
        ),
    },
    ...normalize(fields, edit),
  ],
});

export default createSchema;
