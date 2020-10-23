import { componentTypes } from '@@ddf';

const createSchema = () => ({
  fields: [{
    component: componentTypes.SUB_FORM,
    name: 'retirement-date-subform',
    title: __('Set/Remove Retirement Date'),
    fields: [{
      component: 'select',
      id: 'formMode',
      name: 'formMode',
      label: __('Enter Retirement Date as'),
      isRequired: true,
      initialValue: 'date',
      options: [
        { label: __('Specific Date and Time'), value: 'date' },
        { label: __('Time Delay from Now'), value: 'delay' }],
    }, {
      component: componentTypes.SUB_FORM,
      name: 'retirement-delay-subform',
      description: __('Time Delay'),
      condition: {
        when: 'formMode',
        is: 'delay',
      },
      fields: [{
        component: 'text-field',
        type: 'number',
        label: __('Months'),
        name: 'months',
        placeholder: '0',
        initialValue: 0,
      }, {
        component: 'text-field',
        type: 'number',
        label: __('Weeks'),
        name: 'weeks',
        placeholder: '0',
        initialValue: 0,
      }, {
        component: 'text-field',
        type: 'number',
        label: __('Days'),
        name: 'days',
        placeholder: '0',
        initialValue: 0,
      }, {
        component: 'text-field',
        type: 'number',
        label: __('Hours'),
        name: 'hours',
        placeholder: '0',
        initialValue: 0,
      },
      ],
    }, {
      component: componentTypes.DATE_PICKER,
      id: 'retirementDate',
      name: 'retirementDate',
      variant: 'date-time',
      label: __('Retirement Date and Time'),
    }, {
      component: 'select',
      id: 'retirementWarning',
      name: 'retirementWarning',
      label: __('Retirement Warning'),
      initialValue: '',
      description: __('* Saving a blank date will remove all retirement dates'),
      options: [
        { label: __('None'), value: '' },
        { label: __('1 Week before retirement'), value: 7 },
        { label: __('2 Weeks before retirement'), value: 14 },
        { label: __('30 Days before retirement'), value: 30 },
      ],
    },
    ],
  },
  ],
});

export default createSchema;
