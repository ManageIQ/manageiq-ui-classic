import { componentTypes, validatorTypes } from '@@ddf';
import FormSpy from '@data-driven-forms/react-form-renderer/form-spy';

const formSchema = (newRecord, groups, userid, isConfirmPasswordEnabled ) => ({
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
          // validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: newRecord,
          isDisabled: userid === 'admin',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'userid',
          name: 'userid',
          label: __('Username'),
          maxLength: 50,
          isRequired: newRecord,
          isDisabled: userid === 'admin',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'password',
          name: 'password',
          // type: 'password',
          label: __('Password'),
          placeholder: newRecord ? ' ' : '●●●●●●●●',
          maxLength: 50,
          isRequired: newRecord,
          isDisabled: !newRecord && isConfirmPasswordEnabled, // Disable when not a new record or isConfirmPasswordEnabled is false
        },
        {
          component: 'changePassword',
          id: 'changePassword',
          name: 'changePassword',
          label: __('Change Password'),
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'verify',
          name: 'verify',
          type: 'password',
          maxLength: 50,
          validate: [
            { type: 'same-password', errorText: 'Passwords do not match' } // Add an error message
          ],
          label: __('Confirm Password'),
          isRequired: newRecord,
          condition: {
            when: 'password',
            isNotEmpty: true
          }
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'email',
          name: 'email',
          label: __('E-mail Address'),
          maxLength: 253,
          autoComplete: 'off',
          validate: [
            {
              type: 'pattern',
              pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
              message: 'Invalid email format',
            },
          ],
          isRequired: newRecord,
        },
        {
          component: componentTypes.SELECT,
          id: 'available_groups',
          name: 'available_groups',
          label: __('Available Groups'),
          placeholder: __('Choose one or more Groups'),
          isRequired: newRecord,
          // isMulti: true,
          options: groups,
        },
      ],
    },
  ],
});

export default formSchema;
