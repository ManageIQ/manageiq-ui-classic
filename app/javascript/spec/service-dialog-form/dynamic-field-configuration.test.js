import {
  optionsFields,
  overridableOptionsFields,
} from '../../components/service-dialog-form/dynamic-fields/dynamic-field-configuration';

// ---------------------------------------------------------------------------
// Helper — recursively collect all `name` values from a DDF field array.
// Handles nested `fields` arrays (e.g. inside FIELD_ARRAY entries).
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// TextBox
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// TextArea — same shape as TextBox
// ---------------------------------------------------------------------------

describe('optionsFields — TextArea', () => {
  it('static: contains default_value, options.protected, validator_type, dialog_field_responders', () => {
    const names = fieldNames(optionsFields('DialogFieldTextAreaBox', false));
    expect(names).toContain('default_value');
    expect(names).toContain('options.protected');
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
});

// ---------------------------------------------------------------------------
// CheckBox
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// DropDownList
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// RadioButton — F12 regression: automation_type must NOT appear
// ---------------------------------------------------------------------------

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

  it('dynamic: does NOT contain automation_type — F12 regression', () => {
    // F12: automation_type selector should only appear for DropDownList, never RadioButton.
    const names = fieldNames(optionsFields('DialogFieldRadioButton', true));
    expect(names).not.toContain('automation_type');
  });

  it('dynamic: does NOT contain resource_action_workflow', () => {
    const names = fieldNames(optionsFields('DialogFieldRadioButton', true));
    expect(names).not.toContain('resource_action_workflow');
  });
});

// ---------------------------------------------------------------------------
// DateControl — F18 regression: load_values_on_init must NOT appear
// ---------------------------------------------------------------------------

describe('optionsFields — DateControl', () => {
  it('static: contains default_value, options.show_past_dates', () => {
    const names = fieldNames(optionsFields('DialogFieldDateControl', false));
    expect(names).toContain('default_value');
    expect(names).toContain('options.show_past_dates');
  });

  it('dynamic: contains show_refresh_button — F18 regression', () => {
    const names = fieldNames(optionsFields('DialogFieldDateControl', true));
    expect(names).toContain('show_refresh_button');
  });

  it('dynamic: does NOT contain load_values_on_init — F18 regression', () => {
    // F18: DateControl does not include dynamic-values.html, so load_values_on_init is absent.
    const names = fieldNames(optionsFields('DialogFieldDateControl', true));
    expect(names).not.toContain('load_values_on_init');
  });
});

// ---------------------------------------------------------------------------
// DateTimeControl — same as DateControl for F18 regression
// ---------------------------------------------------------------------------

describe('optionsFields — DateTimeControl', () => {
  it('dynamic: contains show_refresh_button', () => {
    const names = fieldNames(optionsFields('DialogFieldDateTimeControl', true));
    expect(names).toContain('show_refresh_button');
  });

  it('dynamic: does NOT contain load_values_on_init — F18 regression', () => {
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

// ---------------------------------------------------------------------------
// TagControl — always static; no resource_action
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// overridableOptionsFields
// ---------------------------------------------------------------------------

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
