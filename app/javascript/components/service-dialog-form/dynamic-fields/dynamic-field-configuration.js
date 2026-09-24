import { componentTypes } from '@@ddf';

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

// R2: resetOnChange=true adds the resolveProps side-effect that resets default_value
// when data_type changes (Angular: resetDefaultValue watch #3).
// Used by Dropdown and RadioButton static tabs where default_value is user-editable.
const dataTypeField = (resetOnChange = false) => ({
  component: 'select',
  name: 'data_type',
  label: __('Value type'),
  options: DATA_TYPE_OPTIONS,
  ...(resetOnChange ? {
    resolveProps: (_props, { meta, input }, formOptions) => {
      if (meta.dirty && meta.active !== undefined) {
        const isInt = input.value === 'integer';
        formOptions.change('default_value', isInt ? 0 : '');
      }
      return {};
    },
  } : {}),
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

// Inline validator for the entry-point field — used as a function directly in the
// validate array so DDF's schema type-whitelist is bypassed entirely.
//
// The React EmbeddedAutomateEntryPoint stores a tree-selection object:
//   { element: { metadata: { fqname, domain_fqname }, ... }, ... }
// The React EmbeddedWorkflowEntryPoint stores the table row object:
//   { id: <numeric_id>, name: { text: '...' }, ... }
// An empty/cleared state is {} or undefined.
// Legacy Angular wire format uses ae_class (kept as fallback for editing existing fields).
export const validateEntryPoint = (value) => {
  const hasAutomateSelection = value && value.element && value.element.metadata && value.element.metadata.fqname;
  const hasWorkflowSelection = value && (value.configuration_script_id || value.id);
  // API-loaded automate resource_action may have ae_namespace/ae_class/ae_instance without
  // a tree-selection object — accept any of these as a valid persisted automate entry point.
  const hasLegacyAutomate = value && (value.ae_class || value.ae_namespace || value.ae_instance);
  if (!hasAutomateSelection && !hasWorkflowSelection && !hasLegacyAutomate) {
    return __('Entry Point needs to be set for Dynamic elements');
  }
  return undefined;
};

// automation_type selector (emsWorkflowsEnabled=true), automate entry point,
// workflow entry point, show_refresh_button, load_values_on_init.
// Per Angular source:
//   - Only DropDownList has the automation_type selector (pass emsWorkflowsEnabled=true).
//   - All other types use the automate-only variant (pass emsWorkflowsEnabled=false).
//   - DateControl and DateTimeControl do NOT include dynamic-values.html, so they
//     show show_refresh_button but NOT load_values_on_init (pass showLoadValuesOnInit=false).
const dynamicEntryFields = (emsWorkflowsEnabled = false, showLoadValuesOnInit = true) => [
  ...(emsWorkflowsEnabled
    ? [{
        component: 'select',
        name: 'automation_type',
        label: __('Automation Type'),
        options: [
          { label: __('Embedded Automate'), value: 'embedded_automate' },
          { label: __('Embedded Workflows'), value: 'embedded_workflow' },
        ],
      }]
    : []),
  {
    component: 'embedded-automate-entry-point',
    name: 'resource_action',
    id: 'resource_action',
    label: __('Entry Point'),
    field: 'DialogField',
    type: 'DialogField',
    validate: [validateEntryPoint],
    ...(emsWorkflowsEnabled
      ? { condition: { when: 'automation_type', pattern: /^(?!embedded_workflow$)/ } }
      : {}),
  },
  ...(emsWorkflowsEnabled
    ? [{
        component: 'embedded-workflow-entry-point',
        name: 'resource_action_workflow',
        id: 'resource_action_workflow',
        label: __('Workflow Entry Point'),
        field: 'DialogField',
        type: 'DialogField',
        validate: [validateEntryPoint],
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
  ...(showLoadValuesOnInit
    ? [{
        component: 'switch',
        name: 'load_values_on_init',
        label: __('Load Values on Init'),
        onText: __('Yes'),
        offText: __('No'),
      }]
    : []),
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
        ...dynamicEntryFields(false),
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
        ...dynamicEntryFields(false),
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
        // R3: isMulti tracks force_multi_value live via resolveProps
        resolveProps: (_props, _fieldState, formOptions) => {
          const isMulti = Boolean(formOptions.getState().values?.options?.force_multi_value);
          return { isMulti };
        },
      },
      dataTypeField(true),
      ...sortFields(),
      // R1: Toggling force_multi_value resets default_value (Angular: resetDefaultValue watch)
      {
        component: 'switch',
        name: 'options.force_multi_value',
        label: __('Multiselect'),
        onText: __('Yes'),
        offText: __('No'),
        resolveProps: (_props, { meta, input }, formOptions) => {
          if (meta.dirty && meta.active !== undefined) {
            const isMulti = Boolean(input.value);
            formOptions.change('default_value', isMulti ? [] : '');
          }
          return {};
        },
      },
      // D3: Description column first, Value second — matches Angular DROPDOWN_ENTRY_DESCRIPTION/VALUE order
      // D5: isDraggable only when sort_by === 'none'; when sorted automatically the handle is hidden
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'values',
        label: __('Entries'),
        noItemsMessage: __('None'),
        buttonLabels: { add: __('Add'), remove: __('Remove') },
        AddButtonProps: { size: 'sm' },
        RemoveButtonProps: { size: 'sm' },
        isDraggable: true,
        condition: { when: 'options.sort_by', is: 'none' },
        fields: [
          { component: 'text-field', name: 'description', label: __('Description') },
          { component: 'text-field', name: 'value', label: __('Value') },
        ],
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'values_sorted',
        label: __('Entries'),
        noItemsMessage: __('None'),
        buttonLabels: { add: __('Add'), remove: __('Remove') },
        AddButtonProps: { size: 'sm' },
        RemoveButtonProps: { size: 'sm' },
        condition: { when: 'options.sort_by', pattern: /^(?!none$)/ },
        fields: [
          { component: 'text-field', name: 'description', label: __('Description') },
          { component: 'text-field', name: 'value', label: __('Value') },
        ],
      },
      refresh,
    ];
  }

  if (type === 'DialogFieldRadioButton') {
    if (isDynamic) {
      return [
        ...dynamicEntryFields(false),
        requiredField(),
        dataTypeField(),
        refresh,
      ];
    }
    // Same as Dropdown static minus force_multi_value
    // D3: Description first, Value second (matches Angular column order)
    // D4: RadioButton labels the columns "Key" / "Value" (not "Description" / "Value")
    // D5: isDraggable gated on sort_by === 'none'
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
      dataTypeField(true),
      ...sortFields(),
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'values',
        label: __('Entries'),
        noItemsMessage: __('None'),
        buttonLabels: { add: __('Add'), remove: __('Remove') },
        AddButtonProps: { size: 'sm' },
        RemoveButtonProps: { size: 'sm' },
        isDraggable: true,
        condition: { when: 'options.sort_by', is: 'none' },
        fields: [
          { component: 'text-field', name: 'description', label: __('Key') },
          { component: 'text-field', name: 'value', label: __('Value') },
        ],
      },
      {
        component: componentTypes.FIELD_ARRAY,
        name: 'values_sorted',
        label: __('Entries'),
        noItemsMessage: __('None'),
        buttonLabels: { add: __('Add'), remove: __('Remove') },
        AddButtonProps: { size: 'sm' },
        RemoveButtonProps: { size: 'sm' },
        condition: { when: 'options.sort_by', pattern: /^(?!none$)/ },
        fields: [
          { component: 'text-field', name: 'description', label: __('Key') },
          { component: 'text-field', name: 'value', label: __('Value') },
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
      // D8: Required is placed AFTER Fields to refresh (outside the entry-point tree guard)
      // F18: Date/DateTime do not include dynamic-values.html so load_values_on_init is absent
      return [
        ...dynamicEntryFields(false, false),
        showPastDates,
        refresh,
        requiredField(),
      ];
    }
    // DateTimeControl static: default_value stores 'YYYY-MM-DD HH:MM'.
    // Split into a date picker + a time input (default_value_time) so both parts are editable.
    // normaliseSubmitted recombines them back into a single string on save.
    const dateField = {
      component: 'date-picker',
      name: 'default_value',
      label: __('Default value'),
    };
    const timeField = type === 'DialogFieldDateTimeControl'
      ? {
          component: 'text-field',
          name: 'default_value_time',
          label: __('Time'),
          placeholder: 'HH:MM',
          helperText: __('24-hour format, e.g. 14:30'),
          validate: [{
            type: 'pattern',
            pattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
            message: __('Enter time as HH:MM (00:00–23:59)'),
          }],
        }
      : null;
    return [
      requiredField(),
      dateField,
      ...(timeField ? [timeField] : []),
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
      // D10: Single value switch is hidden when the selected category itself enforces single-value
      // (Angular: ng-if="!vm.modalData.options.category_single_value")
      // D9: Toggling force_single_value resets default_value (Angular: resetDefaultValue watch)
      {
        component: 'switch',
        name: 'options.force_single_value',
        label: __('Single value'),
        onText: __('Yes'),
        offText: __('No'),
        condition: { when: 'options.category_single_value', isEmpty: true },
        resolveProps: (_props, { meta, input }, formOptions) => {
          // Only fire on an active user change (not on initial render)
          if (meta.dirty && meta.active !== undefined) {
            const isMulti = Boolean(input.value);
            formOptions.change('default_value', isMulti ? [] : '');
          }
          return {};
        },
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
    case 'DialogFieldTextBox':
      // D1: default_value text input — type switches to 'password' when Protected is on.
      // Single field with resolveProps avoids the duplicate-name key collision.
      return [
        {
          component: 'text-field',
          name: 'default_value',
          label: __('Default value'),
          resolveProps: (_props, _field, formOptions) => ({
            type: formOptions.getState().values['options.protected'] ? 'password' : 'text',
          }),
        },
        ...visibilityFields(),
      ];
    case 'DialogFieldTextAreaBox':
      // D2: default_value textarea
      return [
        {
          component: 'textarea',
          name: 'default_value',
          label: __('Default value'),
          rows: 3,
        },
        ...visibilityFields(),
      ];
    default:
      // CheckBox, DateControl, DateTimeControl
      return visibilityFields();
  }
};
