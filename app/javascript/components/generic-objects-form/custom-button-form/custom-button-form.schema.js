import { componentTypes, validatorTypes } from '@@ddf';
import { getButtonTypes } from './helper';

const inventoryOptions = [
  { value: 'localhost', label: __('Localhost') },
  { value: 'vmdb_object', label: __('Target Machine') },
  { value: 'manual', label: __('Specific Hosts') },
];

const displayForOptions = [
  { value: 'single', label: __('Single Entity') },
  { value: 'list', label: __('List') },
  { value: 'both', label: __('Single and List') },
];

const submitHowOptions = [
  { value: 'all', label: __('Submit all') },
  { value: 'one', label: __('One by one') },
];

const visibilities = [
  { value: '_All_', label: `<${__('To All')}>` },
  { value: 'role', label: `<${__('By Role')}>` },
];

const createSchema = (distinctInstancesOptions, ansiblePlaybookOptions, roles, serviceDialogs, buttonIcon, url, setState) => ({
  fields: [
    {
      component: componentTypes.SELECT,
      id: 'button_type',
      name: 'options.button_type',
      label: __('Button Type'),
      loadOptions: () => getButtonTypes(),
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'playbook-fields',
      name: 'playbook-fields',
      condition: {
        when: 'options.button_type',
        is: 'ansible_playbook',
      },
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'service_template_name',
          name: 'uri_attributes.service_template_name',
          label: __('Playbook Catalog Item'),
          includeEmpty: true,
          options: ansiblePlaybookOptions,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
        },
        {
          component: componentTypes.RADIO,
          id: 'inventory_type',
          name: 'inventory_type',
          label: __('Inventory'),
          options: inventoryOptions,
        },
        {
          component: componentTypes.TEXT_FIELD,
          id: 'hosts',
          name: 'hosts',
          label: __('Enter a comma separated list of IP or DNS names'),
          maxLength: 255,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
          condition: {
            when: 'inventory_type',
            is: 'manual',
          },
        },
      ],
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'name-wrapper',
      name: 'subform-1',
      fields: [
        {
          component: componentTypes.TEXT_FIELD,
          id: 'name',
          name: 'name',
          label: __('Name'),
          maxLength: 50,
          validate: [{ type: validatorTypes.REQUIRED }],
          isRequired: true,
        },
        {
          component: componentTypes.CHECKBOX,
          id: 'display',
          name: 'options.display',
          label: __('Display on Button'),
        },
      ],
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'desription',
      name: 'description',
      label: __('Description'),
      maxLength: 255,
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
    },
    {
      component: 'font-icon-picker-ddf',
      id: 'button_icon',
      name: 'options.button_icon',
      label: __('Icon'),
      selected: buttonIcon,
      onChangeURL: url,
      iconChange: (icon) => {
        setState((state) => ({ ...state, buttonIcon: icon }));
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'color-select',
      name: 'options.button_color',
      label: __('Icon color'),
      type: 'color',
    },
    {
      component: componentTypes.SELECT,
      id: 'dialog_id',
      name: 'resource_action.dialog_id',
      label: __('Dialog'),
      isSearchable: true,
      simpleValue: true,
      options: serviceDialogs,
    },
    {
      component: componentTypes.SELECT,
      id: 'display_for',
      name: 'options.display_for',
      label: __('Display for'),
      options: displayForOptions,
    },
    {
      component: componentTypes.SELECT,
      id: 'submit_how',
      name: 'options.submit_how',
      label: __('Submit'),
      options: submitHowOptions,
    },
    {
      component: componentTypes.SELECT,
      id: 'ae_instance',
      name: 'resource_action.ae_instance',
      label: __('System/Process'),
      options: distinctInstancesOptions,
      condition: {
        not: { when: 'options.button_type', is: 'ansible_playbook' },
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'ae_message',
      name: 'resource_action.ae_message',
      label: __('Message'),
      maxLength: 255,
      condition: {
        not: { when: 'options.button_type', is: 'ansible_playbook' },
      },
    },
    {
      component: componentTypes.TEXT_FIELD,
      id: 'request',
      name: 'uri_attributes.request',
      label: __('Request'),
      validate: [{ type: validatorTypes.REQUIRED }],
      isRequired: true,
      maxLength: 255,
      condition: {
        not: { when: 'options.button_type', is: 'ansible_playbook' },
      },
    },
    {
      component: componentTypes.SUB_FORM,
      id: 'attribute/value pairs',
      name: 'attribute/value pairs',
      label: __('Attribute/Value Pairs'),
      fields: [
        {
          component: componentTypes.SELECT,
          id: 'visibility',
          name: 'visibility.roles',
          label: __('Role Access'),
          options: visibilities,
        },
        {
          component: componentTypes.SELECT,
          id: 'available_roles',
          name: 'available_roles',
          label: __('User Roles'),
          isMulti: true,
          sortItems: (items) => items,
          condition: {
            when: 'visibility.roles',
            is: 'role',
          },
          options: roles,
        },
      ],
    },
  ],
});

export default createSchema;
