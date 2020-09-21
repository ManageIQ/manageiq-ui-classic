import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

export const createSchema = () => ({
  fields: [
    {
      type: componentTypes.SUB_FORM,
      title: __('Info'),
      fields: [
        {
          type: componentTypes.TEXT_FIELD,
          name: 'description',
          label: __('Description'),
        },
        {
          type: componentTypes.CHECKBOX,
          name: 'enabled',
          label: __('Active'),
        },
        {
          type: componentTypes.SELECT,
          name: 'miq_alert_severity',
          label: __('Severity'),
        },  // TODO options from MiqPolicyController::SEVERITIES
        {
          type: componentTypes.SELECT,
          name: 'miq_alert_db',
          label: __('Based On'),
        },  // TODO options from @edit[:dbs]
        {
          type: componentTypes.SELECT,
          name: 'exp_name',
          label: __('What to Evaluate'),
        },  // TODO options from @edit[:expression_types] = MiqAlert.expression_types(miq_alert_db)
        {
          type: componentTypes.SELECT,
          name: 'exp_event',
          label: __('Driving Event'),
          condition: {
            when: 'miq_alert_db',
            in: [
              'EmsCluster',
              'ExtManagementSystem',
              'Host',
              'MiqServer',
              'PhysicalServer',
              'Storage',
              'Vm',
              // not 'ContainerNode',
              // not 'ContainerProject',
            ], // TODO in not implemented yet ;; 
          },
        },  // TODO options from @edit[:events] + _hourly_timer_
        {
          type: componentTypes.SELECT,
          name: 'repeat_time',
          label: __('Notification Frequency'),
        },  // TODO options from @sb[:alert][:repeat_times | :repeat_times_dwh | :hourly_repeat_times]
      ],
    },

    {
      type: componentTypes.SUB_FORM,
      title: __('Expression'),
      fields: [
        // TODO layouts/exp_editor
      ],
      condition: {
        when: 'exp_name',
        isEmpty: true,
      },
    },
    {
      type: componentTypes.SUB_FORM,
      title: __('TODO Parameters'), // TODO name of the exp_name + "Parameters"
      fields: [
        // TODO layouts/alert_builtin_exp
      ],
      condition: {
        when: 'exp_name',
        in: [ null, undefined, 'nothing' ], // TODO `in` not supported yet
        notMatch: true,
      },
    },

    {
      type: componentTypes.SUB_FORM,
      title: __('E-mail'),
      fields: [
        // TODO layouts/edit_email
      ],
    },

    {
      type: componentTypes.SUB_FORM,
      title: __('SNMP Trap'),
      fields: [
        // TODO miq_policy/alert_snmp
      ],
    },

    {
      type: componentTypes.SUB_FORM,
      title: __('Timeline Event'),
      fields: [
        // TODO miq_policy/alert_evm_event
      ],
    },

    {
      type: componentTypes.SUB_FORM,
      title: __('Management Event'),
      fields: [
        // TODO miq_policy/alert_mgmt_event
      ],
    },
  ],
});
