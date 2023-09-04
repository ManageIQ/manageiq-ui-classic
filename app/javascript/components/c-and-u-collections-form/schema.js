import { componentTypes, validatorTypes } from '@@ddf';

const createSchema = (timezones) => ({
  title: __('Collection Options'),
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'timezone',
      name: 'timezone',
      label: __('Timezone'),
      initialValue: 'UTC',
      validate: [{ type: validatorTypes.REQUIRED }],
      isSearchable: true,
      simpleValue: true,
      options: timezones,
    },
    {
      component: 'date-picker',
      id: 'startDate',
      name: 'startDate',
      label: __('Start Date'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: 'date-picker',
      id: 'endDate',
      name: 'endDate',
      label: __('End Date'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
  ],
});

export default createSchema;
