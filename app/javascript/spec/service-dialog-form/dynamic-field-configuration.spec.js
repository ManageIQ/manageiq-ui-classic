import {
  optionsFields,
  overridableOptionsFields,
  fieldInfoFields,
  validateEntryPoint,
} from '../../components/service-dialog-form/dynamic-fields/dynamic-field-configuration';

// Helper — recursively collect all `name` values from a DDF field array.
// Handles nested `fields` arrays (e.g. inside FIELD_ARRAY entries).

const fieldNames = (fields) => {
  const names = [];
  const walk = (arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((f) => {
      if (f && f.name) names.push(f.name);
      if (f && f.fields) walk(f.fields);
    });
  };
  walk(fields);
  return names;
};

// TextBox

describe('optionsFields — TextBox', () => {
  it('static: contains default_value, options.protected, validator_type, dialog_field_responders', () => {
    const names = fieldNames(optionsFields('DialogFieldTextBox', false));
    expect(names).toContain('default_value');
    expect(names).toContain('options.protected');
    expect(names).toContain('validator_type');
    expect(names).toContain('dialog_field_responders');
  });

  it('static: does NOT contain resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldTextBox', false));
    expect(names).not.toContain('resource_action');
  });

  it('dynamic: contains resource_action, show_refresh_button, load_values_on_init', () => {
    const names = fieldNames(optionsFields('DialogFieldTextBox', true));
    expect(names).toContain('resource_action');
    expect(names).toContain('show_refresh_button');
    expect(names).toContain('load_values_on_init');
  });

  it('dynamic: does NOT contain default_value or automation_type', () => {
    const names = fieldNames(optionsFields('DialogFieldTextBox', true));
    expect(names).not.toContain('default_value');
    expect(names).not.toContain('automation_type');
  });
});

// TextArea — same shape as TextBox

describe('optionsFields — TextArea', () => {
  it('static: contains default_value, options.protected, data_type, validator_type, dialog_field_responders', () => {
    const names = fieldNames(optionsFields('DialogFieldTextAreaBox', false));
    expect(names).toContain('default_value');
    expect(names).toContain('options.protected');
    expect(names).toContain('data_type');
    expect(names).toContain('validator_type');
    expect(names).toContain('dialog_field_responders');
  });

  it('static: does NOT contain resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldTextAreaBox', false));
    expect(names).not.toContain('resource_action');
  });

  it('dynamic: contains resource_action, show_refresh_button, load_values_on_init', () => {
    const names = fieldNames(optionsFields('DialogFieldTextAreaBox', true));
    expect(names).toContain('resource_action');
    expect(names).toContain('show_refresh_button');
    expect(names).toContain('load_values_on_init');
  });

  it('dynamic: does NOT contain default_value or automation_type', () => {
    const names = fieldNames(optionsFields('DialogFieldTextAreaBox', true));
    expect(names).not.toContain('default_value');
    expect(names).not.toContain('automation_type');
  });

  it('dynamic: contains options.protected and data_type', () => {
    const names = fieldNames(optionsFields('DialogFieldTextAreaBox', true));
    expect(names).toContain('options.protected');
    expect(names).toContain('data_type');
  });
});

// CheckBox

describe('optionsFields — CheckBox', () => {
  it('static: contains default_value', () => {
    const names = fieldNames(optionsFields('DialogFieldCheckBox', false));
    expect(names).toContain('default_value');
  });

  it('static: does NOT contain options.sort_by', () => {
    const names = fieldNames(optionsFields('DialogFieldCheckBox', false));
    expect(names).not.toContain('options.sort_by');
  });

  it('dynamic: contains resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldCheckBox', true));
    expect(names).toContain('resource_action');
  });

  it('dynamic: does NOT contain default_value', () => {
    const names = fieldNames(optionsFields('DialogFieldCheckBox', true));
    expect(names).not.toContain('default_value');
  });
});

// DropDownList

describe('optionsFields — DropDownList', () => {
  it('static: contains values, options.sort_by, options.sort_order, options.force_multi_value', () => {
    const names = fieldNames(optionsFields('DialogFieldDropDownList', false));
    expect(names).toContain('values');
    expect(names).toContain('options.sort_by');
    expect(names).toContain('options.sort_order');
    expect(names).toContain('options.force_multi_value');
  });

  it('static: does NOT contain resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldDropDownList', false));
    expect(names).not.toContain('resource_action');
  });

  it('dynamic with emsWorkflowsEnabled=true: contains automation_type, resource_action, resource_action_workflow', () => {
    const names = fieldNames(optionsFields('DialogFieldDropDownList', true, { emsWorkflowsEnabled: true }));
    expect(names).toContain('automation_type');
    expect(names).toContain('resource_action');
    expect(names).toContain('resource_action_workflow');
  });

  it('dynamic with emsWorkflowsEnabled=false: does NOT contain automation_type or resource_action_workflow', () => {
    const names = fieldNames(optionsFields('DialogFieldDropDownList', true, { emsWorkflowsEnabled: false }));
    expect(names).not.toContain('automation_type');
    expect(names).not.toContain('resource_action_workflow');
  });

  it('dynamic with emsWorkflowsEnabled=false: still contains resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldDropDownList', true, { emsWorkflowsEnabled: false }));
    expect(names).toContain('resource_action');
  });
});

// RadioButton — automation_type must NOT appear

describe('optionsFields — RadioButton', () => {
  it('static: contains values, options.sort_by', () => {
    const names = fieldNames(optionsFields('DialogFieldRadioButton', false));
    expect(names).toContain('values');
    expect(names).toContain('options.sort_by');
  });

  it('dynamic: contains resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldRadioButton', true));
    expect(names).toContain('resource_action');
  });

  it('dynamic: does NOT contain automation_type', () => {
    // automation_type selector should only appear for DropDownList, never RadioButton.
    const names = fieldNames(optionsFields('DialogFieldRadioButton', true));
    expect(names).not.toContain('automation_type');
  });

  it('dynamic: does NOT contain resource_action_workflow', () => {
    const names = fieldNames(optionsFields('DialogFieldRadioButton', true));
    expect(names).not.toContain('resource_action_workflow');
  });
});

// DateControl : load_values_on_init must NOT appear

describe('optionsFields — DateControl', () => {
  it('static: contains default_value, options.show_past_dates', () => {
    const names = fieldNames(optionsFields('DialogFieldDateControl', false));
    expect(names).toContain('default_value');
    expect(names).toContain('options.show_past_dates');
  });

  it('dynamic: contains show_refresh_button', () => {
    const names = fieldNames(optionsFields('DialogFieldDateControl', true));
    expect(names).toContain('show_refresh_button');
  });

  it('dynamic: does NOT contain load_values_on_init', () => {
    // DateControl does not include dynamic-values.html, so load_values_on_init is absent.
    const names = fieldNames(optionsFields('DialogFieldDateControl', true));
    expect(names).not.toContain('load_values_on_init');
  });
});

// DateTimeControl — same as DateControl

describe('optionsFields — DateTimeControl', () => {
  it('dynamic: contains show_refresh_button', () => {
    const names = fieldNames(optionsFields('DialogFieldDateTimeControl', true));
    expect(names).toContain('show_refresh_button');
  });

  it('dynamic: does NOT contain load_values_on_init', () => {
    const names = fieldNames(optionsFields('DialogFieldDateTimeControl', true));
    expect(names).not.toContain('load_values_on_init');
  });

  it('static: contains default_value, options.show_past_dates', () => {
    const names = fieldNames(optionsFields('DialogFieldDateTimeControl', false));
    expect(names).toContain('default_value');
    expect(names).toContain('options.show_past_dates');
  });

  it('static: default_value_time field uses component text-field', () => {
    const fields = optionsFields('DialogFieldDateTimeControl', false);
    const timeField = fields.find((f) => f && f.name === 'default_value_time');
    expect(timeField).toBeDefined();
    expect(timeField.component).toBe('text-field');
  });
});

// TagControl — always static; no resource_action

describe('optionsFields — TagControl', () => {
  it('contains options.category_id and options.force_single_value', () => {
    const names = fieldNames(optionsFields('DialogFieldTagControl', false));
    expect(names).toContain('options.category_id');
    expect(names).toContain('options.force_single_value');
  });

  it('does NOT contain resource_action', () => {
    const names = fieldNames(optionsFields('DialogFieldTagControl', false));
    expect(names).not.toContain('resource_action');
  });

  it('contains options.sort_by and options.sort_order', () => {
    const names = fieldNames(optionsFields('DialogFieldTagControl', false));
    expect(names).toContain('options.sort_by');
    expect(names).toContain('options.sort_order');
  });
});

// overridableOptionsFields

describe('overridableOptionsFields — TextBox', () => {
  it('contains default_value and read_only and visible', () => {
    const names = fieldNames(overridableOptionsFields('DialogFieldTextBox'));
    expect(names).toContain('default_value');
    expect(names).toContain('read_only');
    expect(names).toContain('visible');
  });

  it('default_value field uses component text-field', () => {
    const fields = overridableOptionsFields('DialogFieldTextBox');
    const dvField = fields.find((f) => f && f.name === 'default_value');
    expect(dvField).toBeDefined();
    expect(dvField.component).toBe('text-field');
  });
});

describe('overridableOptionsFields — TextArea', () => {
  it('contains default_value and read_only and visible', () => {
    const names = fieldNames(overridableOptionsFields('DialogFieldTextAreaBox'));
    expect(names).toContain('default_value');
    expect(names).toContain('read_only');
    expect(names).toContain('visible');
  });

  it('default_value field uses component textarea', () => {
    const fields = overridableOptionsFields('DialogFieldTextAreaBox');
    const dvField = fields.find((f) => f && f.name === 'default_value');
    expect(dvField).toBeDefined();
    expect(dvField.component).toBe('textarea');
  });
});

describe('overridableOptionsFields — DropDownList and RadioButton', () => {
  it('DropDownList contains read_only, visible, options.sort_by', () => {
    const names = fieldNames(overridableOptionsFields('DialogFieldDropDownList'));
    expect(names).toContain('read_only');
    expect(names).toContain('visible');
    expect(names).toContain('options.sort_by');
  });

  it('RadioButton contains read_only, visible, options.sort_by', () => {
    const names = fieldNames(overridableOptionsFields('DialogFieldRadioButton'));
    expect(names).toContain('read_only');
    expect(names).toContain('visible');
    expect(names).toContain('options.sort_by');
  });

  it('neither contains default_value', () => {
    expect(fieldNames(overridableOptionsFields('DialogFieldDropDownList'))).not.toContain('default_value');
    expect(fieldNames(overridableOptionsFields('DialogFieldRadioButton'))).not.toContain('default_value');
  });
});

describe('overridableOptionsFields — default (CheckBox, DateControl, DateTimeControl)', () => {
  it('CheckBox contains read_only and visible', () => {
    const names = fieldNames(overridableOptionsFields('DialogFieldCheckBox'));
    expect(names).toContain('read_only');
    expect(names).toContain('visible');
  });

  it('CheckBox does not contain default_value', () => {
    expect(fieldNames(overridableOptionsFields('DialogFieldCheckBox'))).not.toContain('default_value');
  });
});

// validateEntryPoint — pure validator function used in DDF validate arrays

describe('validateEntryPoint', () => {
  it('returns an error string for undefined', () => {
    expect(typeof validateEntryPoint(undefined)).toBe('string');
  });

  it('returns an error string for an empty object', () => {
    expect(typeof validateEntryPoint({})).toBe('string');
  });

  it('returns undefined for a tree-selection object with fqname (automate new selection)', () => {
    const value = { element: { metadata: { fqname: '/ManageIQ/Service/Lifecycle/refresh' } } };
    expect(validateEntryPoint(value)).toBeUndefined();
  });

  it('returns undefined for a legacy API-loaded automate entry (ae_class present)', () => {
    // API-loaded fields carry ae_namespace/ae_class/ae_instance — no element wrapper
    const value = { resource_type: 'DialogField', ae_namespace: 'Service', ae_class: 'Lifecycle', ae_instance: 'refresh', ae_attributes: {} };
    expect(validateEntryPoint(value)).toBeUndefined();
  });

  it('returns undefined when only ae_namespace is present (partial legacy automate)', () => {
    const value = { ae_namespace: 'Service' };
    expect(validateEntryPoint(value)).toBeUndefined();
  });

  it('returns undefined for a workflow row with id (workflow new selection)', () => {
    const value = { id: 42, name: { text: 'My Workflow' } };
    expect(validateEntryPoint(value)).toBeUndefined();
  });

  it('returns undefined for a workflow row with configuration_script_id (persisted workflow)', () => {
    const value = { configuration_script_id: 99, resource_type: 'DialogField', ae_attributes: {} };
    expect(validateEntryPoint(value)).toBeUndefined();
  });

  it('returns an error string when value has element but no metadata', () => {
    const value = { element: { id: 'node-1' } };
    expect(typeof validateEntryPoint(value)).toBe('string');
  });
});

// validate array presence — confirm required validators are wired into the schema

describe('fieldInfoFields — validate arrays', () => {
  it('label field has a required validator', () => {
    const fields = fieldInfoFields(true);
    const labelField = fields.find((f) => f.name === 'label');
    expect(labelField).toBeDefined();
    expect(labelField.validate).toBeDefined();
    expect(labelField.validate.some((v) => v.type === 'required')).toBe(true);
  });

  it('name field has a required validator', () => {
    const fields = fieldInfoFields(true);
    const nameField = fields.find((f) => f.name === 'name');
    expect(nameField).toBeDefined();
    expect(nameField.validate).toBeDefined();
    expect(nameField.validate.some((v) => v.type === 'required')).toBe(true);
  });

  it('dynamic toggle is absent for TagControl (showDynamic=false)', () => {
    const names = fieldInfoFields(false).map((f) => f.name);
    expect(names).not.toContain('dynamic');
  });

  it('dynamic toggle is present for all other types (showDynamic=true)', () => {
    const names = fieldInfoFields(true).map((f) => f.name);
    expect(names).toContain('dynamic');
  });
});

describe('optionsFields — DateTimeControl time field validate array', () => {
  it('default_value_time has a pattern validator for HH:MM format', () => {
    const fields = optionsFields('DialogFieldDateTimeControl', false);
    const timeField = fields.find((f) => f && f.name === 'default_value_time');
    expect(timeField).toBeDefined();
    expect(timeField.validate).toBeDefined();
    const patternValidator = timeField.validate.find((v) => v.type === 'pattern');
    expect(patternValidator).toBeDefined();
    expect(patternValidator.pattern).toBeInstanceOf(RegExp);
  });

  it('HH:MM pattern accepts valid times', () => {
    const fields = optionsFields('DialogFieldDateTimeControl', false);
    const timeField = fields.find((f) => f && f.name === 'default_value_time');
    const { pattern } = timeField.validate.find((v) => v.type === 'pattern');
    expect(pattern.test('00:00')).toBe(true);
    expect(pattern.test('14:30')).toBe(true);
    expect(pattern.test('23:59')).toBe(true);
  });

  it('HH:MM pattern rejects invalid times', () => {
    const fields = optionsFields('DialogFieldDateTimeControl', false);
    const timeField = fields.find((f) => f && f.name === 'default_value_time');
    const { pattern } = timeField.validate.find((v) => v.type === 'pattern');
    expect(pattern.test('24:00')).toBe(false);
    expect(pattern.test('9:5')).toBe(false);
    expect(pattern.test('14:60')).toBe(false);
    expect(pattern.test('')).toBe(false);
  });
});

describe('optionsFields — dynamic entry point validate function is wired', () => {
  const dynamicTypes = [
    'DialogFieldTextBox',
    'DialogFieldTextAreaBox',
    'DialogFieldCheckBox',
    'DialogFieldDropDownList',
    'DialogFieldRadioButton',
    'DialogFieldDateControl',
    'DialogFieldDateTimeControl',
  ];

  test.each(dynamicTypes)('%s dynamic: resource_action carries validateEntryPoint', (type) => {
    const fields = optionsFields(type, true, { emsWorkflowsEnabled: true });
    // Walk all fields (including nested) to find resource_action
    const allFields = [];
    const walk = (arr) => arr.forEach((f) => {
      if (f) allFields.push(f);
    });
    walk(fields);
    const raField = allFields.find((f) => f.name === 'resource_action');
    expect(raField).toBeDefined();
    expect(Array.isArray(raField.validate)).toBe(true);
    expect(raField.validate.some((v) => typeof v === 'function')).toBe(true);
  });
});

describe('optionsFields — TextBox vs TextArea structural differences', () => {
  it('TextBox static has data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldTextBox', false))).toContain('data_type');
  });

  it('TextArea static has data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldTextAreaBox', false))).toContain('data_type');
  });

  it('TextBox static has options.protected', () => {
    expect(fieldNames(optionsFields('DialogFieldTextBox', false))).toContain('options.protected');
  });

  it('TextArea static has options.protected', () => {
    expect(fieldNames(optionsFields('DialogFieldTextAreaBox', false))).toContain('options.protected');
  });

  it('TextBox static default_value uses text-field component', () => {
    const fields = optionsFields('DialogFieldTextBox', false);
    const dvField = fields.find((f) => f && f.name === 'default_value');
    expect(dvField).toBeDefined();
    expect(dvField.component).toBe('text-field');
  });

  it('TextArea static default_value uses textarea component', () => {
    const fields = optionsFields('DialogFieldTextAreaBox', false);
    const dvField = fields.find((f) => f && f.name === 'default_value');
    expect(dvField).toBeDefined();
    expect(dvField.component).toBe('textarea');
  });
});

describe('optionsFields — CheckBox structural constraints', () => {
  it('static: does NOT contain data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldCheckBox', false))).not.toContain('data_type');
  });

  it('static: does NOT contain options.protected', () => {
    expect(fieldNames(optionsFields('DialogFieldCheckBox', false))).not.toContain('options.protected');
  });

  it('static: does NOT contain validator_type', () => {
    expect(fieldNames(optionsFields('DialogFieldCheckBox', false))).not.toContain('validator_type');
  });

  it('dynamic: does NOT contain data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldCheckBox', true))).not.toContain('data_type');
  });
});

describe('optionsFields — DateControl / DateTimeControl do not have automation_type', () => {
  it('DateControl static does NOT contain automation_type', () => {
    expect(fieldNames(optionsFields('DialogFieldDateControl', false))).not.toContain('automation_type');
  });

  it('DateTimeControl static does NOT contain automation_type', () => {
    expect(fieldNames(optionsFields('DialogFieldDateTimeControl', false))).not.toContain('automation_type');
  });

  it('DateControl static does NOT contain validator_type', () => {
    expect(fieldNames(optionsFields('DialogFieldDateControl', false))).not.toContain('validator_type');
  });

  it('DateControl dynamic does NOT contain automation_type even when emsWorkflowsEnabled', () => {
    expect(fieldNames(optionsFields('DialogFieldDateControl', true, { emsWorkflowsEnabled: true }))).not.toContain('automation_type');
  });

  it('DateControl dynamic does NOT contain resource_action_workflow even when emsWorkflowsEnabled', () => {
    expect(fieldNames(optionsFields('DialogFieldDateControl', true, { emsWorkflowsEnabled: true }))).not.toContain('resource_action_workflow');
  });
});

describe('optionsFields — Dropdown and RadioButton have data_type', () => {
  it('Dropdown static has data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldDropDownList', false))).toContain('data_type');
  });

  it('RadioButton static has data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldRadioButton', false))).toContain('data_type');
  });

  it('Dropdown dynamic has data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldDropDownList', true))).toContain('data_type');
  });

  it('RadioButton dynamic has data_type', () => {
    expect(fieldNames(optionsFields('DialogFieldRadioButton', true))).toContain('data_type');
  });
});

// Dropdown and RadioButton — required validator on static values FIELD_ARRAY

describe('optionsFields — Dropdown static values FIELD_ARRAY has validate', () => {
  it('DialogFieldDropDownList static: values FIELD_ARRAY has a required validator', () => {
    const fields = optionsFields('DialogFieldDropDownList', false);
    const valuesField = fields.find((f) => f && f.name === 'values');
    expect(valuesField).toBeDefined();
    expect(Array.isArray(valuesField.validate)).toBe(true);
    expect(valuesField.validate.some((v) => v.type === 'required')).toBe(true);
  });

  it('DialogFieldDropDownList static: values_sorted FIELD_ARRAY also has a required validator', () => {
    const fields = optionsFields('DialogFieldDropDownList', false);
    const sortedField = fields.find((f) => f && f.name === 'values_sorted');
    expect(sortedField).toBeDefined();
    expect(sortedField.validate.some((v) => v.type === 'required')).toBe(true);
  });

  it('DialogFieldDropDownList dynamic does NOT have a values FIELD_ARRAY', () => {
    const fields = optionsFields('DialogFieldDropDownList', true);
    expect(fields.find((f) => f && f.name === 'values')).toBeUndefined();
  });

  it('DialogFieldRadioButton static: values FIELD_ARRAY has a required validator', () => {
    const fields = optionsFields('DialogFieldRadioButton', false);
    const valuesField = fields.find((f) => f && f.name === 'values');
    expect(valuesField).toBeDefined();
    expect(Array.isArray(valuesField.validate)).toBe(true);
    expect(valuesField.validate.some((v) => v.type === 'required')).toBe(true);
  });

  it('DialogFieldRadioButton static: values_sorted FIELD_ARRAY also has a required validator', () => {
    const fields = optionsFields('DialogFieldRadioButton', false);
    const sortedField = fields.find((f) => f && f.name === 'values_sorted');
    expect(sortedField).toBeDefined();
    expect(sortedField.validate.some((v) => v.type === 'required')).toBe(true);
  });
});

// TagControl — category_id required validator blocks save without a selection

describe('optionsFields — TagControl options.category_id has validate', () => {
  it('options.category_id has a required validator', () => {
    const fields = optionsFields('DialogFieldTagControl', false);
    const field = fields.find((f) => f && f.name === 'options.category_id');
    expect(field).toBeDefined();
    expect(Array.isArray(field.validate)).toBe(true);
    expect(field.validate.some((v) => v.type === 'required')).toBe(true);
  });

  it('required validator carries an error message', () => {
    const fields = optionsFields('DialogFieldTagControl', false);
    const field = fields.find((f) => f && f.name === 'options.category_id');
    const v = field.validate.find((vv) => vv.type === 'required');
    expect(typeof v.message).toBe('string');
    expect(v.message.length).toBeGreaterThan(0);
  });
});

// validator_rule is conditional on validator_type — only shown when validation is enabled

describe('optionsFields — validator_rule condition is gated on validator_type', () => {
  it('TextBox static: validator_rule field has a condition referencing validator_type', () => {
    const fields = optionsFields('DialogFieldTextBox', false);
    const allFields = [];
    const walk = (arr) => arr.forEach((f) => {
      if (f) allFields.push(f);
      if (f && f.fields) walk(f.fields);
    });
    walk(fields);
    const ruleField = allFields.find((f) => f.name === 'validator_rule');
    expect(ruleField).toBeDefined();
    expect(ruleField.condition).toBeDefined();
    expect(ruleField.condition.when).toBe('validator_type');
  });
});
