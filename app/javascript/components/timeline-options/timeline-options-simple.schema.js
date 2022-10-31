import { componentTypes, validatorTypes } from '@@ddf';

const createSchemaSimple = (
  timelineEvents, managementGroupNames, managementGroupLevels, policyGroupNames, policyGroupLevels
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
          id: 'timelineEvents',
          name: 'timelineEvents',
          label: __('Event Types'),
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          includeEmpty: true,
          options: timelineEvents,
        },
        /// ///////////////////
        // Managment Events //
        /// ///////////////////
        {
          component: componentTypes.SELECT,
          id: 'managementGroupNames',
          name: 'managementGroupNames',
          label: __('Category Managements'),
          options: managementGroupNames,
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          simpleValue: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            and: [
              {
                when: 'timelineEvents',
                is: 'EmsEvent',
              },
            ],
          },
        },
        {
          component: componentTypes.SELECT,
          id: 'managementGroupLevels',
          name: 'managementGroupLevels',
          label: __('Levels Management'),
          options: managementGroupLevels,
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          simpleValue: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            and: [
              {
                when: 'timelineEvents',
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
          id: 'policyGroupNames',
          name: 'policyGroupNames',
          label: __('Category Policy'),
          options: policyGroupNames,
          isMulti: true,
          isSearchable: true,
          isClearable: true,
          simpleValue: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            and: [
              {
                when: 'timelineEvents',
                is: 'MiqEvent',
              },
            ],
          },
        },
        {
          component: componentTypes.RADIO,
          label: __('Event Result'),
          name: 'policyGroupLevels',
          id: 'policyGroupLevels',
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          options: policyGroupLevels,
          condition: {
            and: [
              {
                when: 'timelineEvents',
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
