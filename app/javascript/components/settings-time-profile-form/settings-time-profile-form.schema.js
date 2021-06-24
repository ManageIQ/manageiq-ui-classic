import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import { days, hoursAM, hoursPM } from './options-helper';

const buildOptions = (timezones) => {
  const tzArray = [{ label: __('<Determine at Run Time>'), value: 'null' }];
  for (let i = 0; i < timezones.length; i += 1) {
    const tz = timezones[i];
    const tempObj = { label: tz[0], value: tz[1] };
    tzArray.push(tempObj);
  }
  return tzArray;
};

const createSchema = (fields, tz, timeProfileId, timezones, show) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      id: 'description',
      name: 'description',
      label: __('Description'),
      maxLength: 128,
      isRequired: true,
      validate: [{
        type: validatorTypes.REQUIRED,
      }],
    },
    {
      component: componentTypes.SELECT,
      id: 'profile_type',
      name: 'profile_type',
      label: __('Scope'),
      options: [
        {
          value: 'user',
          label: __('Current User'),
        },
        {
          value: 'global',
          label: __('All Users'),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'CheckboxDays',
      name: 'days',
      title: __('Days'),
      fields: [
        {
          component: componentTypes.CHECKBOX,
          label: __('Select All Days'),
          name: 'DaysSelectAll',
          id: 'DaysSelectAll',
          initialValue: false,
        },
        {
          component: componentTypes.CHECKBOX,
          label: __('Days'),
          isRequired: true,
          name: 'profile.days',
          validate: [{
            type: validatorTypes.REQUIRED,
          }],
          condition: {
            when: 'DaysSelectAll',
            is: !true,
          },
          options: days,
        },
        {
          component: componentTypes.CHECKBOX,
          label: __('Days'),
          isRequired: true,
          name: 'profile.daysAll',
          isDisabled: true,
          initialValue: [0, 1, 2, 3, 4, 5, 6],
          condition: {
            when: 'DaysSelectAll',
            is: true,
          },
          options: days,
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'CheckboxHours',
      name: 'hours',
      title: __('Hours'),
      fields: [
        {
          component: componentTypes.CHECKBOX,
          label: __('Select All Hours'),
          name: 'HoursSelectAll',
          id: 'HoursSelectAll',
          initialValue: false,
        },
        {
          component: componentTypes.CHECKBOX,
          label: __('Hours (AM)'),
          isRequired: true,
          name: 'profile.hoursAM',
          condition: {
            when: 'HoursSelectAll',
            is: !true,
          },
          options: hoursAM,
        },
        {
          component: componentTypes.CHECKBOX,
          label: __('Hours (PM)'),
          isRequired: true,
          name: 'profile.hoursPM',
          condition: {
            when: 'HoursSelectAll',
            is: !true,
          },
          options: hoursPM,
        },
        {
          component: componentTypes.CHECKBOX,
          label: __('Hours (AM)'),
          isRequired: true,
          name: 'profile.hoursAMAll',
          isDisabled: true,
          initialValue: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          condition: {
            when: 'HoursSelectAll',
            is: true,
          },
          options: hoursAM,
        },
        {
          component: componentTypes.CHECKBOX,
          label: __('Hours (PM)'),
          isRequired: true,
          name: 'profile.hoursPMAll',
          isDisabled: true,
          initialValue: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
          condition: {
            when: 'HoursSelectAll',
            is: true,
          },
          options: hoursPM,
        },
      ],
    },
    {
      component: componentTypes.SELECT,
      id: 'profile.tz',
      name: 'profile.tz',
      label: __('Timezone'),
      initialValue: timeProfileId === '' ? 'null' : tz,
      options: buildOptions(timezones),
    },
    {
      component: componentTypes.SWITCH,
      id: 'rollup_daily_metrics',
      name: 'rollup_daily_metrics',
      label: __('Roll Up Daily Performance'),
      onText: __('On'),
      offText: __('Off'),
      condition: {
        when: 'profile.tz',
        pattern: new RegExp('[^null]'),
      },
    },
    ...(show ? [
      {
        id: 'hoursWarning',
        component: componentTypes.PLAIN_TEXT,
        name: 'hoursWarning',
        label: __('At least one hour needs to be selected'),
      },
    ] : []),
  ],
});

export default createSchema;
