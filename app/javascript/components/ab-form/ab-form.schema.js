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

const visibilityOptions = [
  { value: '_ALL_', label: `<${__('To All')}>` },
  { value: 'role', label: `<${__('By Role')}>` },
];

const createSchema = ({
  roles, serviceDialogs, buttonIcon, setState, distinctInstances, ansiblePlaybooks,
}) => ({
  fields: [
    {
      component: componentTypes.TABS,
      id: 'ab-tabs',
      name: 'ab-tabs',
      fields: [
        // ── Options tab ────────────────────────────────────────────────────────
        {
          name: 'options-tab',
          title: __('Options'),
          fields: [
            {
              component: componentTypes.SELECT,
              id: 'button_type',
              name: 'options.button_type',
              label: __('Button Type'),
              loadOptions: () => getButtonTypes(),
            },
            // Ansible playbook sub-fields (conditional)
            {
              component: componentTypes.SUB_FORM,
              id: 'playbook-fields',
              name: 'playbook-fields',
              condition: { when: 'options.button_type', is: 'ansible_playbook' },
              fields: [
                {
                  component: componentTypes.SELECT,
                  id: 'service_template_name',
                  name: 'uri_attributes.service_template_name',
                  label: __('Playbook Catalog Item'),
                  includeEmpty: true,
                  options: ansiblePlaybooks,
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
                  condition: { when: 'inventory_type', is: 'manual' },
                },
              ],
            },
            // Name + Display on Button
            {
              component: componentTypes.SUB_FORM,
              id: 'name-wrapper',
              name: 'name-wrapper',
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
              id: 'description',
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
              iconChange: (icon) => setState((s) => ({ ...s, buttonIcon: icon })),
            },
            {
              component: componentTypes.TEXT_FIELD,
              id: 'button_color',
              name: 'options.button_color',
              label: __('Icon Color'),
              type: 'color',
            },
            // Dialog — hidden for ansible_playbook, disabled when display_for != single
            {
              component: componentTypes.SELECT,
              id: 'dialog_id',
              name: 'resource_action.dialog_id',
              label: __('Dialog'),
              isSearchable: true,
              simpleValue: true,
              includeEmpty: true,
              options: serviceDialogs,
              condition: { not: { when: 'options.button_type', is: 'ansible_playbook' } },
              resolveProps: (_props, _field, formOptions) => {
                const displayFor = formOptions.getState().values?.options?.display_for;
                return { isDisabled: displayFor !== 'single' };
              },
            },
            {
              component: componentTypes.CHECKBOX,
              id: 'open_url',
              name: 'options.open_url',
              label: __('Open URL'),
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
          ],
        },

        // ── Advanced tab ───────────────────────────────────────────────────────
        {
          name: 'advanced-tab',
          title: __('Advanced'),
          fields: [
            // Enablement expression + Disabled Button Text (only when display_for == single)
            {
              component: componentTypes.SUB_FORM,
              id: 'enablement-section',
              name: 'enablement-section',
              title: __('Enablement'),
              condition: { when: 'options.display_for', is: 'single' },
              fields: [
                {
                  component: 'expression-editor',
                  id: 'enablement_expression',
                  name: 'enablement_expression',
                  label: __('Expression'),
                  sectionTitle: __('Expression'),
                  towhatField: 'applies_to_class_field',
                  onlyTags: false,
                },
                {
                  component: componentTypes.TEXT_FIELD,
                  id: 'disabled_text',
                  name: 'disabled_text',
                  label: __('Disabled Button Text'),
                  maxLength: 50,
                },
              ],
            },
            // Visibility expression (only when display_for == single)
            {
              component: componentTypes.SUB_FORM,
              id: 'visibility-section',
              name: 'visibility-section',
              title: __('Visibility'),
              condition: { when: 'options.display_for', is: 'single' },
              fields: [
                {
                  component: 'expression-editor',
                  id: 'visibility_expression',
                  name: 'visibility_expression',
                  label: __('Expression'),
                  sectionTitle: __('Expression'),
                  towhatField: 'applies_to_class_field',
                  onlyTags: false,
                },
              ],
            },
            // AE fields — hidden for ansible_playbook
            {
              component: componentTypes.SELECT,
              id: 'ae_instance',
              name: 'resource_action.ae_instance',
              label: __('System/Process'),
              options: distinctInstances,
              condition: { not: { when: 'options.button_type', is: 'ansible_playbook' } },
            },
            {
              component: componentTypes.TEXT_FIELD,
              id: 'ae_message',
              name: 'resource_action.ae_message',
              label: __('Message'),
              maxLength: 255,
              condition: { not: { when: 'options.button_type', is: 'ansible_playbook' } },
            },
            {
              component: componentTypes.TEXT_FIELD,
              id: 'request',
              name: 'uri_attributes.request',
              label: __('Request'),
              validate: [{ type: validatorTypes.REQUIRED }],
              isRequired: true,
              maxLength: 255,
              condition: { not: { when: 'options.button_type', is: 'ansible_playbook' } },
            },
            // Attribute/Value Pairs — hidden for ansible_playbook
            {
              component: 'key-value-list',
              id: 'attribute_pairs',
              name: 'attribute_pairs',
              label: __('Attribute/Value Pairs'),
              keyLabel: __('Name'),
              valueLabel: __('Value'),
              condition: { not: { when: 'options.button_type', is: 'ansible_playbook' } },
            },
            // Role Access
            {
              component: componentTypes.SUB_FORM,
              id: 'role-access',
              name: 'role-access',
              fields: [
                {
                  component: componentTypes.SELECT,
                  id: 'visibility',
                  name: 'visibility.roles',
                  label: __('Role Access'),
                  options: visibilityOptions,
                },
                {
                  component: componentTypes.SELECT,
                  id: 'available_roles',
                  name: 'available_roles',
                  label: __('User Roles'),
                  isMulti: true,
                  sortItems: (items) => items,
                  options: roles,
                  condition: { when: 'visibility.roles', is: 'role' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

export default createSchema;
