import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

const  createSchema = (maxDescLen, action_types, scanProfiles, alerts, categories, selectedCategories, parentTypes, playbooks, snmpVersions) => (
  {
    title: 'Basic Information',
    name: 'basic_information',
    component: componentTypes.SUB_FORM,
    fields: [{
      component: 'text-field',
      name: 'description',
      maxLength: maxDescLen,
      label: __('Description'),
      validateOnMount: true,
      autoFocus: true,
      validate: [{
        type: 'required-validator',
      }],
    },{
      component: componentTypes.SELECT,
      name: 'action_type',
      label: __('Actin Type'),
      placeholder: `<${__('Choose')}>`,
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED
      }],
      options: action_types.map(({ id, description }) => ({ label: description, value: id })),
    },{
        title: 'Analysis Profiles',
        name: 'assign_scan_profile',
        component: componentTypes.SUB_FORM,
        fields: [
          {
            component: componentTypes.SELECT,
            name: 'assign_scan_profile_select',
            label: __('Analysis Profiles'),
            placeholder: `<${__('Choose')}>`,
            validateOnMount: true,
            validate: [{
              type: validatorTypes.REQUIRED
            }],
            options: scanProfiles,
          }],
        condition: {
          when: 'action_type',
          is: 'assign_scan_profile'
        },
    },{
      title: 'Snapshot Settings',
      name: 'create_snapshot',
      component: componentTypes.SUB_FORM,
        fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'create_snapshot_select',
          label: __('Snapshot Settings'),
          maxLength: maxDescLen,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
        }],
      }],
      condition: {
        when: 'action_type',
        is: 'create_snapshot'
      }
    },{
      component: componentTypes.TEXT_FIELD,
      name: 'custom_automation',
      label: __('custom_automation'),
      maxLength: maxDescLen,
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED
      }],
      options: action_types.map(({ id, description }) => ({ label: description, value: id })),
      condition: {
        when: 'action_type',
        is: 'custom_automation'
      }
    },{
      component: componentTypes.SELECT,
      name: 'delete_snapshots_by_age',
      label: __('delete_snapshots_by_age'),
      placeholder: `<${__('Choose')}>`,
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED
      }],
      options: action_types.map(({ id, description }) => ({ label: description, value: id })),
      condition: {
        when: 'action_type',
        is: 'delete_snapshots_by_age'
      }
    },{
      title: 'E-mail Settings',
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'email',
          label: __('From E-mail Address'),
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],

        },
        {
          component: componentTypes.TEXT_FIELD,
          name: 'email',
          label: __('To E-mail Address'),
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],

        },
      ],
      component: componentTypes.SUB_FORM,
      condition: {
        when: 'action_type',
        is: 'email'
      }
    },{
      title: 'Select Alerts to be Evaluated',
      name: 'evaluate_alerts',
      component: componentTypes.SUB_FORM,
      fields: [
        {
          component: 'dual-list-select',
          rightId: 'selected_alerts',
          leftId: 'available_alerts',
          rightTitle: __('Selected Alerts'),
          leftTitle: __('Availables Alerts'),
          moveLeftTitle: __('Move selected Alerts to left'),
          moveRightTitle: __('Move selected Alerts to right'),
          moveAllRightTitle: __('Move all Alerts to right'),
          name: 'evaluate_alerts',
          label: __('Select Alerts to be Evaluated'),
          options: alerts
        }],
      condition: {
        when: 'action_type',
        is: 'evaluate_alerts'
      }
    },{
      title: 'Inherit Tags Settings',
      name: 'inherit_parent_tags',
      component: componentTypes.SUB_FORM,
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'inherit_parent_tags_type',
          label: __('Parent Type'),
          placeholder: `<${__('Choose')}>`,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],
          options: parentTypes,
        },
        {
        component: componentTypes.SELECT,
        name: 'inherit_parent_tags_select',
        label: __('Categories'),
        placeholder: `<${__('Choose')}>`,
        multi: true,
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED
        }],
        options: categories,
      }],
      condition: {
        when: 'action_type',
        is: 'inherit_parent_tags'
      }
    },{
      title: 'Reconfigure CPU',
      name: 'reconfigure_cpus',
      component: componentTypes.SUB_FORM,
      fields: [
        {
        component: componentTypes.SELECT,
        name: 'reconfigure_cpus_select',
        label: __('Number of CPU'),
        placeholder: `<${__('Choose')}>`,
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED
        }],
        options: [{label: 1, value: 1}, {value: 2, label: 2}, {value: 4, label: 4}],
      }],
      condition: {
        when: 'action_type',
        is: 'reconfigure_cpus'
      }
    },{
      title: 'Reconfigure Memory',
      name: 'reconfigure_memory',
      component: componentTypes.SUB_FORM,
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'memory_value',
          label: __('Memory Size'),
          placeholder: `<${__('Enter the number between 4 - 65636 MB')}>`,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED,
          }],
        }],
      condition: {
        when: 'action_type',
        is: 'reconfigure_memory'
      }
    },{
      title: 'Remove Tags Settings',
      name: 'remove_tags',
      component: componentTypes.SUB_FORM,
      fields: [
        {
        component: componentTypes.SELECT,
        name: 'remove_tags_select', // MULTISELECT HERE
        label: __('Category'),
        multi: true,
        placeholder: `<${__('Choose')}>`,
        validateOnMount: true,
        validate: [{
          type: validatorTypes.REQUIRED
        }],
        options: categories,
      }],
      condition: {
        when: 'action_type',
        is: 'remove_tags'
      }
    },{
      title: 'Run an Ansible Playbook',
      name: 'remove_tags',
      component: componentTypes.SUB_FORM,
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'run_ansible_playbook',
          label: __('Playbook Catalog Item'),
          placeholder: `<${__('Choose')}>`,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],
          options: playbooks,
        }],
      condition: {
        when: 'action_type',
        is: 'run_ansible_playbook'
      }
    },{
      title: 'Custom Attribute Settings',
      name: 'set_custom_attribute',
      component: componentTypes.SUB_FORM,
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          name: 'set_custom_attribute_name',
          label: __('Attribute Name'),
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],
        },{
          component: componentTypes.TEXT_FIELD,
          name: 'set_custom_attribute_value',
          label: __('Value to Set'),
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],
        }],
      condition: {
        when: 'action_type',
        is: 'set_custom_attribute'
      }
    },{
      title: 'SNMP Trap Settings',
      name: 'snmp_trap',
      component: componentTypes.SUB_FORM,
      fields: [
        {
          component: componentTypes.SELECT,
          name: 'snmp_version',
          label: __('Version'),
          placeholder: `<${__('Choose')}>`,
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],
          options: snmpVersions,
        },{
          component: componentTypes.TEXT_FIELD,
          name: 'trap_id',
          label: __('Value to Set'),
          validateOnMount: true,
          validate: [{
            type: validatorTypes.REQUIRED
          }],
        }],
      condition: {
        when: 'action_type',
        is: 'snmp_trap'
      }
    },{
      component: componentTypes.SELECT,
      name: 'tag',
      label: __('tag'),
      placeholder: `<${__('Choose')}>`,
      validateOnMount: true,
      validate: [{
        type: validatorTypes.REQUIRED
      }],
      options: action_types.map(({ id, description }) => ({ label: description, value: id })),
      condition: {
        when: 'action_type',
        is: 'tag'
      }
    }],
  }
)

export default createSchema;
