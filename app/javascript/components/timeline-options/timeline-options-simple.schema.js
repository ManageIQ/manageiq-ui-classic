import { componentTypes, validatorTypes } from '@@ddf';

const createSchemaSimple = (
  timeline_events, management_group_names, management_group_levels, policy_group_names, policy_group_levels
) => ({
  fields: [
    {
      component: componentTypes.SUB_FORM,
      title: __('Options'),
      id: 'options',
      name: 'options',
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'timeline_events',
          name: 'timeline_events',
          label: __('Event Types'),
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          includeEmpty: true,
          options: timeline_events,
        },
        /// ///////////////////
        // Managment Events //
        /// ///////////////////
        {
          component: componentTypes.SELECT,
          id: 'management_group_names',
          name: 'management_group_names',
          label: __('Category Managements'),
          options: management_group_names,
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          simpleValue: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            and: [
              {
                when: 'timeline_events',
                is: 'EmsEvent',
              },
            ],
          },
        },
        {
          component: componentTypes.SELECT,
          id: 'management_group_levels',
          name: 'management_group_levels',
          label: __('Levels Management'),
          options: management_group_levels,
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          simpleValue: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            and: [
              {
                when: 'timeline_events',
                is: 'EmsEvent',
              },
            ],
          },
        },
        /// ///////////////
        // Policy Events //
        /// ///////////////
        {
          component: componentTypes.SELECT,
          id: 'policy_group_names',
          name: 'policy_group_names',
          label: __('Category Policy'),
          options: policy_group_names,
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          simpleValue: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            and: [
              {
                when: 'timeline_events',
                is: 'MiqEvent',
              },
            ],
          },
        },
        {
          component: componentTypes.RADIO,
          label: __('Event Result'),
          name: 'policy_group_levels',
          id: 'policy_group_levels',
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          options: policy_group_levels,
          condition: {
            and: [
              {
                when: 'timeline_events',
                is: 'MiqEvent',
              },
            ],
          },
        },
      ],
    },
    /// //////
    // Time //
    /// //////
    {
      component: componentTypes.SUB_FORM,
      title: __('Dates Range'),
      id: 'datesRange',
      name: 'datesRange',
      fields: [
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
    },
  ],
});

export default createSchemaSimple;
