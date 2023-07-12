import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (newRecord) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      id: 'name-wrapper',
      name: 'subform-1',
      title: __('Category Information'),
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'name',
          name: 'name',
          label: __('Name'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          isDisabled: !newRecord,
          className: 'settings_category_name',
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'description',
          name: 'description',
          label: __('Description'),
          maxLength: 150,
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'example_text',
          name: 'example_text',
          label: __('Long Description'),
          maxLength: 150,
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
        },
        {
          component: componentTypes.SWITCH,
          id: 'show',
          name: 'show',
          label: __('Show in console'),
          maxLength: 50,
          onText: __('Yes'),
          offText: __('No'),
        },
        {
          component: componentTypes.SWITCH,
          id: 'single_value',
          name: 'single_value',
          label: __('Single value'),
          maxLength: 50,
          isDisabled: !newRecord,
          className: 'settings_category_single_value',
          onText: __('Yes'),
          offText: __('No'),
        },
        {
          component: componentTypes.SWITCH,
          id: 'perf_by_tag',
          name: 'perf_by_tag',
          label: __('Capture C & U Data by Tag'),
          maxLength: 50,
          onText: __('Yes'),
          offText: __('No'),
        },
        {
          component: 'plain-text',
          name: 'plain-text-component',
          label: __('* Name and Single Value fields cannot be edited after adding a category.'),
        },
      ],
    },
  ],
});

export default createSchema;
