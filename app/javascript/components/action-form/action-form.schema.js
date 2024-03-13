/* eslint-disable no-restricted-syntax */
import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';
import {
  assignProfiles, findInitialValue, buildParentTypeOptions, buildSnapShotAgeOptions,
  buildInheritTagOptions, buildAlertOptions, buildRunAnsible, buildTags,
} from './helper';

function createSchema(recordId, promise, inheritTags, evaluateAlert, tags, ansibleInventory, snapshotAge, parentType, inventoryType) {
  const subForm = [
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-1',
      name: 'subform-1',
      title: __('Analysis Profiles'),
      condition: {
        when: 'action_type',
        is: 'assign_scan_profile',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'options.scan_item_set_name',
          name: 'options.scan_item_set_name',
          label: __('Analysis Profiles'),
          placeholder: __('<Choose>'),
          includeEmpty: true,
          options: assignProfiles,
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-2',
      name: 'subform-2',
      title: __('Snapshot Settings'),
      condition: {
        when: 'action_type',
        is: 'create_snapshot',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Snapshot Name'),
          maxLength: 128,
          id: 'options.name',
          name: 'options.name',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-3',
      name: 'subform-3',
      title: __('Snapshot Age Settings'),
      condition: {
        when: 'action_type',
        is: 'delete_snapshots_by_age',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          label: __('Delete if Older than'),
          id: 'options.age',
          name: 'options.age',
          placeholder: __('<Choose>'),
          includeEmpty: true,
          options: buildSnapShotAgeOptions(snapshotAge),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-4',
      name: 'subform-4',
      title: __('Select Alerts to be Evaluated'),
      condition: {
        when: 'action_type',
        is: 'evaluate_alerts',
      },
      fields: [
        {
          component: componentTypes.DUAL_LIST_SELECT,
          id: 'options.alert_guids',
          name: 'options.alert_guids',
          label: __(' '),
          leftTitle: __('Available Alerts:'),
          rightTitle: __('Selected Alerts:'),
          allToRight: false,
          moveLeftTitle: __('Remove'),
          moveAllLeftTitle: __('Remove All'),
          moveRightTitle: __('Add'),
          moveAllRightTitle: __('Add All'),
          noValueTitle: __('No option selected'),
          noOptionsTitle: __('No available options'),
          filterOptionsTitle: __('Filter options'),
          filterValuesTitle: __('Filter values'),
          AddButtonProps: {
            size: 'small',
          },
          AddAllButtonProps: {
            size: 'small',
          },
          RemoveButtonProps: {
            size: 'small',
          },
          RemoveAllButtonProps: {
            size: 'small',
          },
          options: buildAlertOptions(evaluateAlert),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-5',
      name: 'subform-5',
      title: __('Inherit Tags Settings'),
      condition: {
        when: 'action_type',
        is: 'inherit_parent_tags',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'options.parent_type',
          name: 'options.parent_type',
          label: __('Parent Type'),
          placeholder: __('<Choose>'),
          includeEmpty: true,
          options: buildParentTypeOptions(parentType),
        },
        {
          component: componentTypes.SELECT,
          id: 'options.cats',
          name: 'options.cats',
          label: __('Categories'),
          placeholder: __('<Choose>'),
          isMulti: true,
          options: buildInheritTagOptions(inheritTags),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-6',
      name: 'subform-6',
      title: __('Custom Automation'),
      condition: {
        when: 'action_type',
        is: 'custom_automation',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Message:'),
          maxLength: 128,
          id: 'options.ae_message',
          name: 'options.ae_message',
        },
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Request:'),
          maxLength: 128,
          id: 'options.ae_request',
          name: 'options.ae_request',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-7',
      name: 'subform-7',
      title: __('Attribute/Value Pairs'),
      condition: {
        when: 'action_type',
        is: 'custom_automation',
      },
      fields: [
        {
          component: componentTypes.FIELD_ARRAY,
          name: 'options.ae_hash',
          id: 'options.ae_hash',
          fieldKey: 'field_array',
          AddButtonProps: {
            size: 'small',
          },
          RemoveButtonProps: {
            size: 'small',
          },
          fields: [
            {
              component: componentTypes.TEXT_FIELD,
              name: 'attribute',
              id: 'attribute',
              label: 'attribute',
              isRequired: true,
              validate: [{ type: validatorTypes.REQUIRED }],
            },
            {
              component: componentTypes.TEXT_FIELD,
              name: 'value',
              id: 'value',
              label: 'value',
              isRequired: true,
              validate: [{ type: validatorTypes.REQUIRED }],
            },
          ],
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-8',
      name: 'subform-8',
      title: __('Reconfigure CPUs'),
      condition: {
        when: 'action_type',
        is: 'reconfigure_cpus',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'options.value',
          name: 'options.value',
          label: __('Number of CPU\'s'),
          initialValue: '1',
          options: [1, 2, 4].map((n) => ({ label: n.toString(), value: n.toString() })),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-9',
      name: 'subform-9',
      title: __('Reconfigure Memory'),
      condition: {
        when: 'action_type',
        is: 'reconfigure_memory',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Memory Size'),
          maxLength: 128,
          id: 'options.value',
          name: 'options.value',
          placeholder: '(Enter the value between 4 - 65636 MB)',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-10',
      name: 'subform-10',
      title: __('Remove Tags Settings'),
      condition: {
        when: 'action_type',
        is: 'remove_tags',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'options.cats',
          name: 'options.cats',
          label: __('Categories'),
          placeholder: __('<Choose>'),
          isMulti: true,
          options: buildInheritTagOptions(inheritTags),
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-11',
      name: 'subform-11',
      title: __('Run an Ansible Playbook'),
      condition: {
        when: 'action_type',
        is: 'run_ansible_playbook',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'options.service_template_name',
          name: 'options.service_template_name',
          label: __('Playbook Catalog Item'),
          placeholder: __('<Choose>'),
          includeEmpty: true,
          options: buildRunAnsible(ansibleInventory),
        },
        {
          component: componentTypes.RADIO,
          label: __('Inventory'),
          name: 'options.inventory_type',
          id: 'options.inventory_type',
          initialValue: findInitialValue(inventoryType, recordId),
          options: [
            {
              label: 'LocalHost',
              value: 'LocalHost',
            },
            {
              label: 'Target Machine',
              value: 'Target Machine',
            },
            {
              label: 'Specific Hosts',
              value: 'Specific Hosts',
            },
          ],
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-12',
      name: 'subform-12',
      condition: {
        and: [{ when: 'options.inventory_type', is: 'Specific Hosts' }, { when: 'action_type', is: 'run_ansible_playbook' }],
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'options.hosts',
          name: 'options.hosts',
          label: __(' '),
          placeholder: 'Enter a comma separated list of IP or DNS names',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-13',
      name: 'subform-13',
      title: __('E-mail Settings'),
      condition: {
        when: 'action_type',
        is: 'email',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('From E-mail Address (leave blank for default)'),
          maxLength: 128,
          id: 'options.from',
          name: 'options.from',
          placeholder: '(Default: cfadmin@cfserver.com)',
        },
        {
          component: componentTypes.TEXT_FIELD,
          label: __('To E-mail Address'),
          maxLength: 128,
          id: 'options.to',
          name: 'options.to',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-14',
      name: 'subform-14',
      title: __('SNMP Trap Settings'),
      condition: {
        when: 'action_type',
        is: 'snmp_trap',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Host'),
          maxLength: 128,
          id: 'options.host',
          name: 'options.host',
        },
        {
          component: componentTypes.SELECT,
          id: 'options.snmp_version',
          name: 'options.snmp_version',
          label: __('Version'),
          initialValue: 'v1',
          options: ['v1', 'v2'].map((n) => ({ label: n, value: n })),
        },
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Trap Number'),
          maxLength: 128,
          id: 'options.trap_id',
          name: 'options.trap_id',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-15',
      name: 'subform-15',
      title: __('Variables'),
      condition: {
        when: 'action_type',
        is: 'snmp_trap',
      },
      fields: [
        {
          component: componentTypes.FIELD_ARRAY,
          name: 'options.variables',
          fieldKey: 'field_array',
          id: 'options.variables',
          AddButtonProps: {
            size: 'small',
          },
          RemoveButtonProps: {
            size: 'small',
          },
          fields: [
            {
              component: componentTypes.TEXT_FIELD,
              name: 'oid',
              id: 'oid',
              label: 'Object ID',
            },
            {
              component: componentTypes.SELECT,
              id: 'var_type',
              name: 'var_type',
              label: __('Type'),
              initialValue: 'Counter32',
              loadOptions: () =>
                promise.then(
                  ({
                    data: {
                    // eslint-disable-next-line camelcase
                      snmp_trap,
                    },
                  }) =>
                    Object.values(snmp_trap).sort().map((key) => ({
                      value: key,
                      label: key,
                    })),
                ),
            },
            {
              component: componentTypes.TEXT_FIELD,
              name: 'value',
              id: 'value',
              label: 'Value',
            },
          ],
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-16',
      name: 'subform-16',
      title: __('Custom Attribute Settings'),
      condition: {
        when: 'action_type',
        is: 'set_custom_attribute',
      },
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Attribute Name'),
          maxLength: 128,
          id: 'options.attribute',
          name: 'options.attribute',
        },
        {
          component: componentTypes.TEXT_FIELD,
          label: __('Value to Set'),
          maxLength: 128,
          id: 'options.value',
          name: 'options.value',
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'subform-17',
      name: 'subform-17',
      title: __('Applied Tag'),
      condition: {
        when: 'action_type',
        is: 'tag',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'options.tags',
          name: 'options.tags',
          label: __('Tag to Apply'),
          isRequired: true,
          validate: [{ type: validatorTypes.REQUIRED }],
          options: buildTags(tags, inheritTags),
        },
      ],
    },
  ];

  const fields = [{
    component: componentTypes.SUB_FORM,
    title: __('Basic Information'),
    id: 'basic-information',
    name: 'basic-information',
    fields: [
      {
        component: componentTypes.TEXT_FIELD,
        id: 'description',
        name: 'description',
        label: __('Description'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        maxLength: 50,
      },
      {
        component: componentTypes.SELECT,
        id: 'action_type',
        name: 'action_type',
        label: __('Action Type'),
        placeholder: __('<Choose>'),
        isRequired: true,
        validate: [{ type: validatorTypes.REQUIRED }],
        loadOptions: () =>
          promise.then(
            ({
              data: {
                // eslint-disable-next-line camelcase
                action_types,
              },
            }) =>
              Object.values(action_types).sort().map((key) => ({
                label: __(key),
                value: Object.keys(action_types)[Object.values(action_types).indexOf(key)],
              })),
          ),
        includeEmpty: true,
      }, ...subForm],
  },
  ];
  return { fields };
}

export default createSchema;
