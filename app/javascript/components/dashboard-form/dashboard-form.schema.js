import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

function createSchema(maxNameLen, maxDescLen, readOnly) {
  const fields = [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      label: __('Name'),
      maxLength: maxNameLen,
      validate: [
        {
          type: validatorTypes.REQUIRED,
          message: __('Required')
        },
        {
          type: validatorTypes.MAX_LENGTH,
          message: _('Maximum allowed length is 20 characters.')
        },
        {
          type: validatorTypes.PATTERN_VALIDATOR,
          pattern: '(.)*(\\|)',
          message: _("Name cannot contain \"|\"")
        }
      ]
    },
    {
      component: componentTypes.TEXT_FIELD,
      name: 'description',
      label: __('Name'),
      maxLength: maxDescLen,
      validate: [{
        type: validatorTypes.REQUIRED,
        message: __('Required')
      }]
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'locked',
      label: __('Locked')
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'reset_upon_login',
      label: __('Reset Dashboard upon login')
    }
  ];
  return { fields };
}

export default createSchema;
