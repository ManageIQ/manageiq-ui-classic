import { componentTypes, validatorTypes } from '@@ddf';
import FormSpy from '@data-driven-forms/react-form-renderer/form-spy';

const formSchema = (newRecord) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'name-wrapper',
      name: 'subform-1',
      title: __('User Information'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'name',
          name: 'name',
          label: __('Full Name'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          // isDisabled: !newRecord,
          className: '',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'userid',
          name: 'userid',
          label: __('Username'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          // isDisabled: !newRecord,
          className: '',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'password',
          name: 'password',
          label: __('Password'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          // isDisabled: !newRecord,
        },
        // {
        //   component: componentTypes.SWITCH,
        //   id: 'show',
        //   name: 'show',
        //   label: __('Change password'),
        //   isDisabled: newRecord,
        // },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'verify',
          name: 'verify',
          type: 'password',
          maxLength: 50,
          validate: [
            { type: validatorTypes.REQUIRED },
          ],
          label: __('Confirm Password'),
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'email',
          name: 'email',
          label: __('E-mail Address'),
          maxLength: 253,
          autoComplete: 'off',
          validate: [
            { type: validatorTypes.REQUIRED },
            {
              type: 'pattern',
              pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
              message: 'Not valid email',
            },
          ],
          isRequired: true,
          // isDisabled: !newRecord,
          className: '',
        },
        {
          component: componentTypes.SELECT,
          id: 'available_groups',
          name: 'available_groups',
          label: __('Available Groups'),
          placeholder: __('Choose one or more Groups'),
          newRecord,
          isMulti: true,
        },
        {
          component: 'plain-text',
          name: 'plain-text-component',
          label: __('Selected Groups'),
        },
      ],
    },
  ],
});

export default formSchema;
