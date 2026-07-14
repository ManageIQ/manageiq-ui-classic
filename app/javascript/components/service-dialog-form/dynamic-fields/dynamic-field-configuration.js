/**
 * DDF field definitions for the EditFieldModal tabs.
 *
 * Design: atomic building-block functions that return small field-def arrays.
 * Two public compositor functions assemble Tab 2 / Tab 4 for any type × mode.
 *
 * Callers use (in tab order):
 *   fieldInfoFields(showDynamic)             → Tab 1 field list
 *   optionsFields(type, isDynamic, opts)     → Tab 2 field list
 *   advancedFields()                         → Tab 3 field list
 *   overridableOptionsFields(type)           → Tab 4 field list (dynamic only)
 */

// ── Shared option lists ───────────────────────────────────────────────────────

export const SORT_BY_OPTIONS = [
  { label: __('None'), value: 'none' },
  { label: __('Description'), value: 'description' },
  { label: __('Value'), value: 'value' },
];

export const SORT_ORDER_OPTIONS = [
  { label: __('Ascending'), value: 'ascending' },
  { label: __('Descending'), value: 'descending' },
];

export const DATA_TYPE_OPTIONS = [
  { label: __('String'), value: 'string' },
  { label: __('Integer'), value: 'integer' },
];

// ── Tab 1: Field Information ──────────────────────────────────────────────────
// showDynamic=false for TagControl (no dynamic toggle per spec A6)

export const fieldInfoFields = (showDynamic = true) => [
  {
    component: 'text-field',
    name: 'label',
    label: __('Label'),
    isRequired: true,
    validate: [{ type: 'required' }],
  },
  {
    component: 'text-field',
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validate: [{ type: 'required' }],
  },
  {
    component: 'textarea',
    name: 'description',
    label: __('Help'),
    rows: 3,
  },
  ...(showDynamic
    ? [{
        component: 'switch',
        name: 'dynamic',
        label: __('Dynamic'),
        onText: __('Yes'),
        offText: __('No'),
      }]
    : []),
];

// ─────────────────────────────────────────────────────────────────────────────
// Atomic building blocks (internal helpers used by optionsFields below)
// ─────────────────────────────────────────────────────────────────────────────

const requiredField = () => ({
  component: 'switch',
  name: 'required',
  label: __('Required'),
  onText: __('Yes'),
  offText: __('No'),
});

const visibilityFields = () => [
  {
    component: 'switch',
    name: 'read_only',
    label: __('Read only'),
    onText: __('Yes'),
    offText: __('No'),
  },
  {
    component: 'switch',
    name: 'visible',
    label: __('Visible'),
    onText: __('Yes'),
    offText: __('No'),
  },
];

const sortFields = () => [
  {
    component: 'select',
    name: 'options.sort_by',
    label: __('Sort by'),
    options: SORT_BY_OPTIONS,
  },
  {
    component: 'select',
    name: 'options.sort_order',
    label: __('Sort order'),
    options: SORT_ORDER_OPTIONS,
  },
];

const dataTypeField = () => ({
  component: 'select',
  name: 'data_type',
  label: __('Value type'),
  options: DATA_TYPE_OPTIONS,
});

// validator_type switch + conditional rule + conditional message
const validationFields = () => [
  {
    component: 'switch',
    name: 'validator_type',
    label: __('Validation'),
    onText: __('Yes'),
    offText: __('No'),
  },
  {
    component: 'text-field',
    name: 'validator_rule',
    label: __('Validator'),
    condition: { when: 'validator_type', isNotEmpty: true },
  },
  {
    component: 'text-field',
    name: 'validator_message',
    label: __('Validation Message'),
    condition: { when: 'validator_type', isNotEmpty: true },
  },
];

// automation_type selector (emsWorkflowsEnabled), automate entry point,
// workflow entry point, show_refresh_button, load_values_on_init
const dynamicEntryFields = (emsWorkflowsEnabled = false) => [
  ...(emsWorkflowsEnabled
    ? [{
        component: 'select',
        name: 'automation_type',
        label: __('Automation Type'),
        options: [
          { label: __('Embedded Automate'), value: 'embedded_automate' },
          { label: __('Embedded Workflow'), value: 'embedded_workflow' },
        ],
      }]
    : []),
  {
    component: 'embedded-automate-entry-point',
    name: 'resource_action',
    label: __('Entry Point'),
    ...(emsWorkflowsEnabled
      ? { condition: { when: 'automation_type', isNot: 'embedded_workflow' } }
      : {}),
  },
  ...(emsWorkflowsEnabled
    ? [{
        component: 'embedded-workflow-entry-point',
        name: 'resource_action',
        label: __('Workflow Entry Point'),
        condition: { when: 'automation_type', is: 'embedded_workflow' },
      }]
    : []),
  {
    component: 'switch',
    name: 'show_refresh_button',
    label: __('Show Refresh Button'),
    onText: __('Yes'),
    offText: __('No'),
  },
  {
    component: 'switch',
    name: 'load_values_on_init',
    label: __('Load Values on Init'),
    onText: __('Yes'),
    offText: __('No'),
  },
];

const fieldsToRefreshField = (dynamicFields = []) => ({
  component: 'select',
  name: 'dialog_field_responders',
  label: __('Fields to refresh'),
  isMulti: true,
  options: dynamicFields.map((f) => ({ label: f.label || f.name, value: f.name })),
});

// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: Options compositor
//
//   optionsFields(type, isDynamic, opts) → complete field list for Tab 2
//
//   opts: {
//     emsWorkflowsEnabled: bool,
//     dynamicFields: [],       ← for dialog_field_responders
//     defaultValueOptions: [], ← for Dropdown/RadioButton default_value select
//     categories: [],          ← for TagControl category select
//   }
// ─────────────────────────────────────────────────────────────────────────────

export const optionsFields = (type, isDynamic, opts = {}) => {
  const {
    emsWorkflowsEnabled = false,
    dynamicFields = [],
    defaultValueOptions = [],
    categories = [],
  } = opts;

  const refresh = fieldsToRefreshField(dynamicFields);

  // TextBox and TextArea share the same dynamic tab; static tabs differ only
  // in how default_value is rendered (text-input vs textarea).
  if (type === 'DialogFieldTextBox' || type === 'DialogFieldTextAreaBox') {
    if (isDynamic) {
      return [
        ...dynamicEntryFields(emsWorkflowsEnabled),
        requiredField(),
        {
          component: 'switch',
          name: 'options.protected',
          label: __('Protected'),
          onText: __('Yes'),
          offText: __('No'),
        },
        dataTypeField(),
        ...validationFields(),
        refresh,
      ];
    }
    const defaultValueField = type === 'DialogFieldTextAreaBox'
      ? { component: 'textarea', name: 'default_value', label: __('Default value'), rows: 3 }
      : { component: 'text-field', name: 'default_value', label: __('Default value') };
    return [
      defaultValueField,
      {
        component: 'switch',
        name: 'options.protected',
        label: __('Protected'),
        onText: __('Yes'),
        offText: __('No'),
      },
      requiredField(),
      ...visibilityFields(),
      dataTypeField(),
      ...validationFields(),
      refresh,
    ];
  }

  if (type === 'DialogFieldCheckBox') {
    if (isDynamic) {
      return [
        ...dynamicEntryFields(emsWorkflowsEnabled),
        requiredField(),
        refresh,
      ];
    }
    return [
      {
        component: 'switch',
        name: 'default_value',
        label: __('Default value'),
        onText: __('Yes'),
        offText: __('No'),
      },
      requiredField(),
      ...visibilityFields(),
      refresh,
    ];
  }

  if (type === 'DialogFieldDropDownList') {
    if (isDynamic) {
      return [
        ...dynamicEntryFields(emsWorkflowsEnabled),
        requiredField(),
        {
          component: 'switch',
          name: 'options.force_multi_value',
          label: __('Multiselect'),
          onText: __('Yes'),
          offText: __('No'),
        },
        dataTypeField(),
        refresh,
      ];
    }
    return [
      ...visibilityFields(),
      requiredField(),
      {
        component: 'select',
        name: 'default_value',
        label: __('Default value'),
        options: defaultValueOptions,
        isMulti: false,
      },
      dataTypeField(),
      ...sortFields(),
      {
        component: 'switch',
        name: 'options.force_multi_value',
        label: __('Multiselect'),
        onText: __('Yes'),
        offText: __('No'),
      },
      {
        component: 'field-array',
        name: 'values',
        label: __('Entries'),
        fields: [
          { component: 'text-field', name: 'value', label: __('Value') },
          { component: 'text-field', name: 'description', label: __('Description') },
        ],
      },
      refresh,
    ];
  }

  if (type === 'DialogFieldRadioButton') {
    if (isDynamic) {
      return [
        ...dynamicEntryFields(emsWorkflowsEnabled),
        requiredField(),
        dataTypeField(),
        refresh,
      ];
    }
    // Same as Dropdown static minus force_multi_value
    return [
      ...visibilityFields(),
      requiredField(),
      {
        component: 'select',
        name: 'default_value',
        label: __('Default value'),
        options: defaultValueOptions,
        isMulti: false,
      },
      dataTypeField(),
      ...sortFields(),
      {
        component: 'field-array',
        name: 'values',
        label: __('Entries'),
        fields: [
          { component: 'text-field', name: 'value', label: __('Value') },
          { component: 'text-field', name: 'description', label: __('Description') },
        ],
      },
      refresh,
    ];
  }

  if (type === 'DialogFieldDateControl' || type === 'DialogFieldDateTimeControl') {
    const showPastDates = {
      component: 'switch',
      name: 'options.show_past_dates',
      label: __('Show Past Dates'),
      onText: __('Yes'),
      offText: __('No'),
    };
    if (isDynamic) {
      return [
        ...dynamicEntryFields(emsWorkflowsEnabled),
        showPastDates,
        requiredField(),
        refresh,
      ];
    }
    return [
      requiredField(),
      {
        component: 'date-picker',
        name: 'default_value',
        label: __('Default value'),
      },
      ...visibilityFields(),
      showPastDates,
      refresh,
    ];
  }

  if (type === 'DialogFieldTagControl') {
    // Always static (no dynamic mode for TagControl per spec)
    return [
      requiredField(),
      ...visibilityFields(),
      {
        component: 'select',
        name: 'options.category_id',
        label: __('Category'),
        options: categories.map((c) => ({ label: c.description || c.name, value: String(c.id) })),
      },
      {
        component: 'switch',
        name: 'options.force_single_value',
        label: __('Single value'),
        onText: __('Yes'),
        offText: __('No'),
      },
      dataTypeField(),
      ...sortFields(),
      refresh,
    ];
  }

  // Fallback: should never be reached with a known type
  return [refresh];
};

// ── Tab 3: Advanced ───────────────────────────────────────────────────────────
// Identical for every type × mode — no args needed.

export const advancedFields = () => [
  {
    component: 'switch',
    name: 'reconfigurable',
    label: __('Reconfigurable'),
    onText: __('Yes'),
    offText: __('No'),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tab 4: Overridable Options compositor (only shown when dynamic === true)
//
//   overridableOptionsFields(type) → field list
// ─────────────────────────────────────────────────────────────────────────────

export const overridableOptionsFields = (type) => {
  switch (type) {
    case 'DialogFieldDropDownList':
    case 'DialogFieldRadioButton':
      // visibility + sort
      return [...visibilityFields(), ...sortFields()];
    default:
      // TextBox, TextArea, CheckBox, DateControl, DateTimeControl
      return visibilityFields();
  }
};
