import {
  buildInitialValues,
  normaliseSubmitted,
} from '../../components/service-dialog-form/edit-field-modal/index.jsx';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Minimal field shape — mirrors the makeField helper in helper.test.js */
const makeField = (type = 'DialogFieldTextBox', extra = {}) => ({
  name: 'field_1',
  label: 'Field One',
  description: '',
  type,
  dynamic: false,
  required: false,
  read_only: false,
  visible: true,
  data_type: 'string',
  show_refresh_button: false,
  load_values_on_init: true,
  dialog_field_responders: [],
  options: {},
  validator_type: false,
  validator_rule: '',
  validator_message: '',
  reconfigurable: false,
  resource_action: { resource_type: 'DialogField', ae_attributes: {} },
  ...extra,
});

// ---------------------------------------------------------------------------
// buildInitialValues
// ---------------------------------------------------------------------------

describe('buildInitialValues', () => {
  describe('options object shape', () => {
    it('produces a nested options object (not flat "options.sort_by" keys) for Dropdown', () => {
      const field = makeField('DialogFieldDropDownList');
      const result = buildInitialValues(field);

      expect(result.options).toBeDefined();
      expect(typeof result.options).toBe('object');
      // Must NOT have flat dot-key at top level
      expect(result['options.sort_by']).toBeUndefined();
      expect(result['options.protected']).toBeUndefined();
    });

    it('defaults options.sort_by to "description" when field has no options', () => {
      const field = makeField('DialogFieldDropDownList', { options: undefined });
      const result = buildInitialValues(field);
      expect(result.options.sort_by).toBe('description');
    });

    it('defaults options.sort_by to "description" when field.options.sort_by is absent', () => {
      const field = makeField('DialogFieldDropDownList', { options: {} });
      const result = buildInitialValues(field);
      expect(result.options.sort_by).toBe('description');
    });

    it('preserves options.sort_by = "value" when field.options.sort_by is "value"', () => {
      const field = makeField('DialogFieldDropDownList', { options: { sort_by: 'value' } });
      const result = buildInitialValues(field);
      expect(result.options.sort_by).toBe('value');
    });

    it('preserves options.sort_by = "none" when field.options.sort_by is "none"', () => {
      const field = makeField('DialogFieldDropDownList', { options: { sort_by: 'none' } });
      const result = buildInitialValues(field);
      expect(result.options.sort_by).toBe('none');
    });
  });

  describe('CheckBox default_value conversion', () => {
    it('converts default_value "t" to boolean true', () => {
      const field = makeField('DialogFieldCheckBox', { default_value: 't' });
      const result = buildInitialValues(field);
      expect(result.default_value).toBe(true);
    });

    it('converts default_value "f" to boolean false', () => {
      const field = makeField('DialogFieldCheckBox', { default_value: 'f' });
      const result = buildInitialValues(field);
      expect(result.default_value).toBe(false);
    });

    it('converts absent default_value to false for CheckBox', () => {
      const field = makeField('DialogFieldCheckBox', { default_value: undefined });
      const result = buildInitialValues(field);
      expect(result.default_value).toBe(false);
    });
  });

  describe('Dropdown / RadioButton values conversion', () => {
    it('converts [[v, d], ...] to [{value, description}, ...] for DropDownList', () => {
      const field = makeField('DialogFieldDropDownList', {
        values: [['1', 'One'], ['2', 'Two']],
      });
      const result = buildInitialValues(field);
      expect(result.values).toEqual([
        { value: '1', description: 'One' },
        { value: '2', description: 'Two' },
      ]);
    });

    it('converts [[v, d], ...] to [{value, description}, ...] for RadioButton', () => {
      const field = makeField('DialogFieldRadioButton', {
        values: [['yes', 'Yes'], ['no', 'No']],
      });
      const result = buildInitialValues(field);
      expect(result.values).toEqual([
        { value: 'yes', description: 'Yes' },
        { value: 'no', description: 'No' },
      ]);
    });

    it('leaves already-object values unchanged for DropDownList', () => {
      const field = makeField('DialogFieldDropDownList', {
        values: [{ value: '1', description: 'One' }],
      });
      const result = buildInitialValues(field);
      expect(result.values).toEqual([{ value: '1', description: 'One' }]);
    });

    it('mirrors values into values_sorted for non-draggable conditional', () => {
      const field = makeField('DialogFieldDropDownList', {
        values: [['1', 'One']],
      });
      const result = buildInitialValues(field);
      expect(result.values_sorted).toEqual(result.values);
    });

    it('produces empty values / values_sorted for DropDownList with no values', () => {
      const field = makeField('DialogFieldDropDownList', { values: undefined });
      const result = buildInitialValues(field);
      expect(result.values).toEqual([]);
      expect(result.values_sorted).toEqual([]);
    });
  });

  describe('load_values_on_init default', () => {
    it('defaults to true when field property is absent', () => {
      const field = makeField('DialogFieldTextBox', { load_values_on_init: undefined });
      const result = buildInitialValues(field);
      expect(result.load_values_on_init).toBe(true);
    });

    it('preserves explicit false value', () => {
      const field = makeField('DialogFieldTextBox', { load_values_on_init: false });
      const result = buildInitialValues(field);
      expect(result.load_values_on_init).toBe(false);
    });
  });

  describe('visible default', () => {
    it('defaults to true when field property is absent', () => {
      const field = makeField('DialogFieldTextBox', { visible: undefined });
      const result = buildInitialValues(field);
      expect(result.visible).toBe(true);
    });

    it('preserves explicit false value', () => {
      const field = makeField('DialogFieldTextBox', { visible: false });
      const result = buildInitialValues(field);
      expect(result.visible).toBe(false);
    });
  });

  describe('automation_type detection', () => {
    it('defaults to embedded_automate when no resource_action', () => {
      const field = makeField('DialogFieldDropDownList');
      const result = buildInitialValues(field);
      expect(result.automation_type).toBe('embedded_automate');
    });

    it('detects embedded_workflow when resource_action has configuration_script_id', () => {
      const field = makeField('DialogFieldDropDownList', {
        resource_action: { resource_type: 'DialogField', ae_attributes: {}, configuration_script_id: 99 },
      });
      const result = buildInitialValues(field);
      expect(result.automation_type).toBe('embedded_workflow');
    });

    it('honours explicit automation_type on field over detection', () => {
      const field = makeField('DialogFieldDropDownList', {
        automation_type: 'embedded_automate',
        resource_action: { resource_type: 'DialogField', ae_attributes: {}, configuration_script_id: 99 },
      });
      const result = buildInitialValues(field);
      expect(result.automation_type).toBe('embedded_automate');
    });
  });
});

// ---------------------------------------------------------------------------
// normaliseSubmitted
// ---------------------------------------------------------------------------

describe('normaliseSubmitted', () => {
  /** Build the minimal submitted shape that normaliseSubmitted receives from final-form */
  const makeSubmitted = (overrides = {}) => ({
    label: 'Field One',
    name: 'field_1',
    description: '',
    dynamic: false,
    required: false,
    read_only: false,
    visible: true,
    data_type: 'string',
    show_refresh_button: false,
    load_values_on_init: true,
    dialog_field_responders: [],
    options: {
      protected: false,
      force_multi_value: false,
      force_single_value: false,
      sort_by: 'description',
      sort_order: 'ascending',
      show_past_dates: false,
      category_id: '',
    },
    validator_type: false,
    validator_rule: '',
    validator_message: '',
    reconfigurable: false,
    resource_action: { resource_type: 'DialogField', ae_attributes: {} },
    resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
    automation_type: 'embedded_automate',
    ...overrides,
  });

  describe('TextBox — options reconstruction', () => {
    it('correctly rebuilds options from nested submitted.options', () => {
      const submitted = makeSubmitted({
        options: { protected: true, sort_by: 'description', sort_order: 'ascending',
          force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.options.protected).toBe(true);
      expect(result.options.sort_by).toBe('description');
    });

    it('strips any flat "options.*" keys that may exist (belt-and-suspenders)', () => {
      const submitted = makeSubmitted({ 'options.protected': true });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result['options.protected']).toBeUndefined();
    });
  });

  describe('CheckBox default_value conversion', () => {
    it('converts boolean true to "t"', () => {
      const result = normaliseSubmitted(
        makeSubmitted({ default_value: true }),
        'DialogFieldCheckBox'
      );
      expect(result.default_value).toBe('t');
    });

    it('converts boolean false to "f"', () => {
      const result = normaliseSubmitted(
        makeSubmitted({ default_value: false }),
        'DialogFieldCheckBox'
      );
      expect(result.default_value).toBe('f');
    });
  });

  describe('Dropdown values conversion', () => {
    it('converts [{value,description},...] back to [[v,d],...]', () => {
      const submitted = makeSubmitted({
        values: [{ value: '1', description: 'One' }, { value: '2', description: 'Two' }],
        values_sorted: [],
        options: { sort_by: 'none', sort_order: 'ascending', protected: false,
          force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
      expect(result.values).toEqual([['1', 'One'], ['2', 'Two']]);
    });

    it('uses values_sorted when sort_by !== "none" and values_sorted is populated', () => {
      const submitted = makeSubmitted({
        values: [{ value: '1', description: 'One' }],
        values_sorted: [{ value: '2', description: 'Two' }],
        options: { sort_by: 'description', sort_order: 'ascending', protected: false,
          force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
      // values_sorted should be the source when sort_by !== 'none'
      expect(result.values).toEqual([['2', 'Two']]);
    });

    it('uses values (draggable list) when sort_by === "none"', () => {
      const submitted = makeSubmitted({
        values: [{ value: '1', description: 'Draggable' }],
        values_sorted: [{ value: '2', description: 'Sorted' }],
        options: { sort_by: 'none', sort_order: 'ascending', protected: false,
          force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
      expect(result.values).toEqual([['1', 'Draggable']]);
    });

    it('removes values_sorted from the result', () => {
      const submitted = makeSubmitted({
        values: [{ value: '1', description: 'One' }],
        values_sorted: [{ value: '1', description: 'One' }],
        options: { sort_by: 'none', sort_order: 'ascending', protected: false,
          force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
      expect(result.values_sorted).toBeUndefined();
    });
  });

  describe('automate tree-selection → ae_namespace/ae_class/ae_instance conversion', () => {
    const makeTreeSelection = (domainFqname) => ({
      element: {
        id: 'node-1',
        name: 'Lifecycle',
        metadata: { fqname: `/ManageIQ${domainFqname}`, domain_fqname: domainFqname },
        isBranch: false,
      },
      isBranch: false,
      isSelected: true,
    });

    it('converts 3-part domain_fqname to ae_namespace/ae_class/ae_instance', () => {
      const treeObj = makeTreeSelection('/Service/Lifecycle/refresh');
      const submitted = makeSubmitted({ resource_action: treeObj });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action.ae_namespace).toBe('Service');
      expect(result.resource_action.ae_class).toBe('Lifecycle');
      expect(result.resource_action.ae_instance).toBe('refresh');
      expect(result.resource_action.element).toBeUndefined();
    });

    it('converts 4-part domain_fqname with nested namespace', () => {
      const treeObj = makeTreeSelection('/Service/Provisioning/StateMachines/refresh');
      const submitted = makeSubmitted({ resource_action: treeObj });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action.ae_namespace).toBe('Service/Provisioning');
      expect(result.resource_action.ae_class).toBe('StateMachines');
      expect(result.resource_action.ae_instance).toBe('refresh');
    });

    it('converts 2-part domain_fqname (class node without instance) to namespace+class only', () => {
      const treeObj = makeTreeSelection('/Service/Lifecycle');
      const submitted = makeSubmitted({ resource_action: treeObj });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action.ae_namespace).toBe('Service');
      expect(result.resource_action.ae_class).toBe('Lifecycle');
      expect(result.resource_action.ae_instance).toBeUndefined();
    });

    it('preserves existing resource_type and ae_attributes during conversion', () => {
      const treeObj = {
        ...makeTreeSelection('/Service/Lifecycle/refresh'),
        resource_type: 'DialogField',
        ae_attributes: { k: 'v' },
      };
      treeObj.element = { ...makeTreeSelection('/Service/Lifecycle/refresh').element };
      const submitted = makeSubmitted({ resource_action: treeObj });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action.resource_type).toBe('DialogField');
    });

    it('leaves resource_action unchanged when it is already an API-shaped object', () => {
      const apiRa = { resource_type: 'DialogField', ae_namespace: 'ns', ae_class: 'cls', ae_instance: 'inst', ae_attributes: {} };
      const submitted = makeSubmitted({ resource_action: apiRa });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action).toEqual(apiRa);
    });
  });

  describe('resource_action_workflow merge', () => {
    it('maps workflow row id to configuration_script_id when automation_type is embedded_workflow', () => {
      const workflow = { id: 42, name: { text: 'My Workflow' }, resource_type: 'DialogField', ae_attributes: {} };
      const submitted = makeSubmitted({
        automation_type: 'embedded_workflow',
        resource_action_workflow: workflow,
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
      expect(result.resource_action).toEqual({
        resource_type: 'DialogField',
        ae_attributes: {},
        id: undefined,
        configuration_script_id: 42,
      });
    });

    it('does NOT merge resource_action_workflow when automation_type is embedded_automate', () => {
      // Even if resource_action_workflow carries an id (e.g. it mirrors the automate resource_action
      // DB record id), the merge must be skipped to avoid corrupting the automate entry point.
      const automateAction = { resource_type: 'DialogField', ae_attributes: {}, ae_namespace: 'ns', ae_class: 'cls', ae_instance: 'inst', id: 99 };
      const submitted = makeSubmitted({
        automation_type: 'embedded_automate',
        resource_action: automateAction,
        resource_action_workflow: { ...automateAction },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
      expect(result.resource_action).toEqual(automateAction);
      expect(result.resource_action.configuration_script_id).toBeUndefined();
    });

    it('leaves resource_action unchanged when automation_type is embedded_automate (no emsWorkflows)', () => {
      const originalAction = { resource_type: 'DialogField', ae_attributes: { ns: '/ns' } };
      const submitted = makeSubmitted({
        resource_action: originalAction,
        resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action).toEqual(originalAction);
    });

    it('removes resource_action_workflow from the result', () => {
      const submitted = makeSubmitted();
      const result = normaliseSubmitted(submitted, 'DialogFieldTextBox');
      expect(result.resource_action_workflow).toBeUndefined();
    });
  });

  describe('validator_type normalisation', () => {
    it('converts boolean true to "regex"', () => {
      const result = normaliseSubmitted(
        makeSubmitted({ validator_type: true }),
        'DialogFieldTextBox'
      );
      expect(result.validator_type).toBe('regex');
    });

    it('converts boolean false to false', () => {
      const result = normaliseSubmitted(
        makeSubmitted({ validator_type: false }),
        'DialogFieldTextBox'
      );
      expect(result.validator_type).toBe(false);
    });

    it('converts falsy (null) to false', () => {
      const result = normaliseSubmitted(
        makeSubmitted({ validator_type: null }),
        'DialogFieldTextBox'
      );
      expect(result.validator_type).toBe(false);
    });
  });

  describe('category side-effects', () => {
    const categories = [
      { id: 7, name: 'env', description: 'Environment', single_value: true },
      { id: 8, name: 'dept', description: 'Department', single_value: false },
    ];

    it('sets category_name, category_description, category_single_value from matching category', () => {
      const submitted = makeSubmitted({
        options: { category_id: '7', sort_by: 'description', sort_order: 'ascending',
          protected: false, force_multi_value: false, force_single_value: false,
          show_past_dates: false, category_single_value: false },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldTagControl', categories);
      expect(result.options.category_name).toBe('env');
      expect(result.options.category_description).toBe('Environment');
      expect(result.options.category_single_value).toBe(true);
    });

    it('does not set category_name when no matching category is found', () => {
      const submitted = makeSubmitted({
        options: { category_id: '99', sort_by: 'description', sort_order: 'ascending',
          protected: false, force_multi_value: false, force_single_value: false,
          show_past_dates: false },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldTagControl', categories);
      expect(result.options.category_name).toBeUndefined();
    });

    it('preserves existing category_single_value when no matching category is found', () => {
      const submitted = makeSubmitted({
        options: { category_id: '99', sort_by: 'description', sort_order: 'ascending',
          protected: false, force_multi_value: false, force_single_value: false,
          show_past_dates: false, category_single_value: true },
      });
      const result = normaliseSubmitted(submitted, 'DialogFieldTagControl', categories);
      expect(result.options.category_single_value).toBe(true);
    });
  });
});

describe('buildInitialValues — blank-entry filtering', () => {
  it('strips fully blank [[v,d]] entries from Dropdown values on load', () => {
    const field = makeField('DialogFieldDropDownList', {
      values: [['opt1', 'Option 1'], ['', ''], ['opt2', 'Option 2']],
    });
    const result = buildInitialValues(field);
    expect(result.values).toEqual([
      { value: 'opt1', description: 'Option 1' },
      { value: 'opt2', description: 'Option 2' },
    ]);
  });

  it('strips blank entries from RadioButton values on load', () => {
    const field = makeField('DialogFieldRadioButton', {
      values: [['', ''], ['yes', 'Yes']],
    });
    const result = buildInitialValues(field);
    expect(result.values).toEqual([{ value: 'yes', description: 'Yes' }]);
  });

  it('keeps entries where only the description is blank', () => {
    const field = makeField('DialogFieldDropDownList', {
      values: [['opt1', '']],
    });
    const result = buildInitialValues(field);
    expect(result.values).toEqual([{ value: 'opt1', description: '' }]);
  });

  it('keeps entries where only the value is blank', () => {
    const field = makeField('DialogFieldDropDownList', {
      values: [['', 'Blank value']],
    });
    const result = buildInitialValues(field);
    expect(result.values).toEqual([{ value: '', description: 'Blank value' }]);
  });

  it('applies the same filtering to values_sorted mirror', () => {
    const field = makeField('DialogFieldDropDownList', {
      values: [['a', 'A'], ['', '']],
    });
    const result = buildInitialValues(field);
    expect(result.values_sorted).toEqual(result.values);
  });
});

describe('buildInitialValues — DateTimeControl', () => {
  it('splits combined ISO datetime into default_value (date array) and default_value_time', () => {
    const field = makeField('DialogFieldDateTimeControl', {
      default_value: '2026-09-26 14:30',
    });
    const result = buildInitialValues(field);
    expect(Array.isArray(result.default_value)).toBe(true);
    expect(result.default_value.length).toBe(1);
    expect(result.default_value[0]).toBeInstanceOf(Date);
    expect(result.default_value[0].getFullYear()).toBe(2026);
    expect(result.default_value[0].getMonth()).toBe(8); // 0-indexed September
    expect(result.default_value[0].getDate()).toBe(26);
    expect(result.default_value_time).toBe('14:30');
  });

  it('produces empty date array and empty time when default_value is absent', () => {
    const field = makeField('DialogFieldDateTimeControl', { default_value: '' });
    const result = buildInitialValues(field);
    expect(result.default_value).toEqual([]);
    expect(result.default_value_time).toBe('');
  });

  it('handles legacy MM/dd/yyyy date portion correctly', () => {
    const field = makeField('DialogFieldDateTimeControl', {
      default_value: '09/26/2026 12:50',
    });
    const result = buildInitialValues(field);
    expect(Array.isArray(result.default_value)).toBe(true);
    expect(result.default_value[0].getFullYear()).toBe(2026);
    expect(result.default_value_time).toBe('12:50');
  });
});

describe('buildInitialValues — DateControl', () => {
  it('converts ISO date string to [Date] array for the date picker', () => {
    const field = makeField('DialogFieldDateControl', { default_value: '2025-01-15' });
    const result = buildInitialValues(field);
    expect(Array.isArray(result.default_value)).toBe(true);
    expect(result.default_value[0]).toBeInstanceOf(Date);
    expect(result.default_value[0].getFullYear()).toBe(2025);
    expect(result.default_value[0].getMonth()).toBe(0);
    expect(result.default_value[0].getDate()).toBe(15);
  });

  it('produces empty array when default_value is absent', () => {
    const field = makeField('DialogFieldDateControl', { default_value: '' });
    const result = buildInitialValues(field);
    expect(result.default_value).toEqual([]);
  });

  it('does NOT produce a default_value_time key', () => {
    const field = makeField('DialogFieldDateControl', { default_value: '2025-01-15' });
    const result = buildInitialValues(field);
    expect(result.default_value_time).toBeUndefined();
  });
});

describe('buildInitialValues — multiselect Dropdown default_value', () => {
  it('preserves an array default_value as-is for multiselect Dropdown', () => {
    const field = makeField('DialogFieldDropDownList', {
      default_value: ['opt1', 'opt2'],
    });
    const result = buildInitialValues(field);
    expect(result.default_value).toEqual(['opt1', 'opt2']);
  });

  it('preserves an empty array default_value (no default selected)', () => {
    const field = makeField('DialogFieldDropDownList', {
      default_value: [],
    });
    const result = buildInitialValues(field);
    expect(result.default_value).toEqual([]);
  });
});

describe('normaliseSubmitted — DateTimeControl round-trip', () => {
  const makeDTSubmitted = (overrides = {}) => ({
    label: 'DT Field',
    name: 'dt_field',
    description: '',
    dynamic: false,
    required: false,
    read_only: false,
    visible: true,
    data_type: 'string',
    show_refresh_button: false,
    load_values_on_init: true,
    dialog_field_responders: [],
    options: {
      protected: false,
      force_multi_value: false,
      force_single_value: false,
      sort_by: 'description',
      sort_order: 'ascending',
      show_past_dates: false,
      category_id: '',
    },
    validator_type: false,
    validator_rule: '',
    validator_message: '',
    reconfigurable: false,
    resource_action: { resource_type: 'DialogField', ae_attributes: {} },
    resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
    automation_type: 'embedded_automate',
    ...overrides,
  });

  it('recombines default_value date array + default_value_time into YYYY-MM-DD HH:MM', () => {
    const submitted = makeDTSubmitted({
      default_value: [new Date(2026, 8, 26)], // September 26 2026
      default_value_time: '14:30',
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldDateTimeControl');
    expect(result.default_value).toBe('2026-09-26 14:30');
    expect(result.default_value_time).toBeUndefined();
  });

  it('recombines when date is given as m/d/yyyy string (DDF date picker submit format)', () => {
    const submitted = makeDTSubmitted({
      default_value: '9/26/2026',
      default_value_time: '08:00',
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldDateTimeControl');
    expect(result.default_value).toBe('2026-09-26 08:00');
  });

  it('produces empty string when both date and time are blank', () => {
    const submitted = makeDTSubmitted({
      default_value: [],
      default_value_time: '',
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldDateTimeControl');
    expect(result.default_value).toBe('');
  });

  it('returns just the date when time string is absent', () => {
    const submitted = makeDTSubmitted({
      default_value: [new Date(2026, 8, 26)],
      default_value_time: '',
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldDateTimeControl');
    expect(result.default_value).toBe('2026-09-26');
  });

  it('removes default_value_time from the result object', () => {
    const submitted = makeDTSubmitted({
      default_value: [new Date(2026, 0, 1)],
      default_value_time: '09:00',
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldDateTimeControl');
    expect(result.default_value_time).toBeUndefined();
  });
});

describe('normaliseSubmitted — DateControl round-trip', () => {
  const makeDateSubmitted = (defaultValue) => ({
    label: 'Date Field',
    name: 'date_field',
    description: '',
    dynamic: false,
    required: false,
    read_only: false,
    visible: true,
    data_type: 'string',
    show_refresh_button: false,
    load_values_on_init: true,
    dialog_field_responders: [],
    options: {
      protected: false,
      force_multi_value: false,
      force_single_value: false,
      sort_by: 'description',
      sort_order: 'ascending',
      show_past_dates: false,
      category_id: '',
    },
    validator_type: false,
    validator_rule: '',
    validator_message: '',
    reconfigurable: false,
    resource_action: { resource_type: 'DialogField', ae_attributes: {} },
    resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
    automation_type: 'embedded_automate',
    default_value: defaultValue,
  });

  it('converts [Date] array back to YYYY-MM-DD string', () => {
    const result = normaliseSubmitted(
      makeDateSubmitted([new Date(2025, 0, 15)]),
      'DialogFieldDateControl'
    );
    expect(result.default_value).toBe('2025-01-15');
  });

  it('converts m/d/yyyy string (DDF submit format) back to YYYY-MM-DD', () => {
    const result = normaliseSubmitted(
      makeDateSubmitted('1/15/2025'),
      'DialogFieldDateControl'
    );
    expect(result.default_value).toBe('2025-01-15');
  });

  it('produces empty string when default_value is an empty array', () => {
    const result = normaliseSubmitted(
      makeDateSubmitted([]),
      'DialogFieldDateControl'
    );
    expect(result.default_value).toBe('');
  });
});

describe('normaliseSubmitted — multiselect Dropdown default_value', () => {
  const makeDropdownSubmitted = (defaultValue) => ({
    label: 'Drop',
    name: 'drop_field',
    description: '',
    dynamic: false,
    required: false,
    read_only: false,
    visible: true,
    data_type: 'string',
    show_refresh_button: false,
    load_values_on_init: true,
    dialog_field_responders: [],
    options: {
      protected: false,
      force_multi_value: true,
      force_single_value: false,
      sort_by: 'none',
      sort_order: 'ascending',
      show_past_dates: false,
      category_id: '',
    },
    validator_type: false,
    validator_rule: '',
    validator_message: '',
    reconfigurable: false,
    resource_action: { resource_type: 'DialogField', ae_attributes: {} },
    resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
    automation_type: 'embedded_automate',
    default_value: defaultValue,
    values: [{ value: 'opt1', description: 'Option 1' }],
    values_sorted: [],
  });

  it('preserves array default_value for multiselect Dropdown after normalise', () => {
    const result = normaliseSubmitted(
      makeDropdownSubmitted(['opt1', 'opt2']),
      'DialogFieldDropDownList'
    );
    expect(result.default_value).toEqual(['opt1', 'opt2']);
  });

  it('preserves empty array default_value when no selection', () => {
    const result = normaliseSubmitted(
      makeDropdownSubmitted([]),
      'DialogFieldDropDownList'
    );
    expect(result.default_value).toEqual([]);
  });
});

// RadioButton shares the same sort_by / values_sorted source-selection logic as Dropdown

describe('normaliseSubmitted — RadioButton values', () => {
  const makeRBSubmitted = (overrides = {}) => ({
    label: 'Radio Field',
    name: 'radio_field',
    description: '',
    dynamic: false,
    required: false,
    read_only: false,
    visible: true,
    data_type: 'string',
    show_refresh_button: false,
    load_values_on_init: true,
    dialog_field_responders: [],
    options: {
      protected: false,
      force_multi_value: false,
      force_single_value: false,
      sort_by: 'description',
      sort_order: 'ascending',
      show_past_dates: false,
      category_id: '',
    },
    validator_type: false,
    validator_rule: '',
    validator_message: '',
    reconfigurable: false,
    resource_action: { resource_type: 'DialogField', ae_attributes: {} },
    resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
    automation_type: 'embedded_automate',
    ...overrides,
  });

  it('uses values (draggable list) when sort_by === "none"', () => {
    const submitted = makeRBSubmitted({
      values: [{ value: 'yes', description: 'Draggable' }],
      values_sorted: [{ value: 'no', description: 'Sorted' }],
      options: { sort_by: 'none', sort_order: 'ascending', protected: false,
        force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldRadioButton');
    expect(result.values).toEqual([['yes', 'Draggable']]);
  });

  it('uses values_sorted when sort_by === "description" and values_sorted is populated', () => {
    const submitted = makeRBSubmitted({
      values: [{ value: 'yes', description: 'Yes' }],
      values_sorted: [{ value: 'no', description: 'No' }],
      options: { sort_by: 'description', sort_order: 'ascending', protected: false,
        force_multi_value: false, force_single_value: false, show_past_dates: false, category_id: '' },
    });
    const result = normaliseSubmitted(submitted, 'DialogFieldRadioButton');
    expect(result.values).toEqual([['no', 'No']]);
  });
});

// TagControl initial values

describe('buildInitialValues — TagControl', () => {
  it('coerces integer category_id to string (integer 7 → "7")', () => {
    const field = makeField('DialogFieldTagControl', { options: { category_id: 7 } });
    const result = buildInitialValues(field);
    expect(result.options.category_id).toBe('7');
  });

  it('preserves force_single_value when true', () => {
    const field = makeField('DialogFieldTagControl', {
      options: { force_single_value: true },
    });
    const result = buildInitialValues(field);
    expect(result.options.force_single_value).toBe(true);
  });

  it('defaults category_single_value to false when absent', () => {
    const field = makeField('DialogFieldTagControl', { options: {} });
    const result = buildInitialValues(field);
    expect(result.options.category_single_value).toBe(false);
  });
});

// automation_type is detected from resource_action shape when not set on the field itself

describe('buildInitialValues — automation_type default', () => {
  it('defaults automation_type to "embedded_automate" for a plain API-loaded TextBox (no automation_type, no configuration_script_id)', () => {
    const field = makeField('DialogFieldTextBox', {
      resource_action: { resource_type: 'DialogField', ae_attributes: {} },
    });
    delete field.automation_type;
    const result = buildInitialValues(field);
    expect(result.automation_type).toBe('embedded_automate');
  });
});

// validator_type normalisation must not affect types that don't use the validator toggle

describe('normaliseSubmitted — CheckBox validator_type is not coerced', () => {
  it('validator_type: false on CheckBox stays false (not converted to "regex")', () => {
    const submitted = {
      label: 'Check',
      name: 'check_field',
      description: '',
      dynamic: false,
      required: false,
      read_only: false,
      visible: true,
      data_type: 'string',
      show_refresh_button: false,
      load_values_on_init: true,
      dialog_field_responders: [],
      options: {
        protected: false,
        force_multi_value: false,
        force_single_value: false,
        sort_by: 'description',
        sort_order: 'ascending',
        show_past_dates: false,
        category_id: '',
      },
      default_value: false,
      validator_type: false,
      validator_rule: '',
      validator_message: '',
      reconfigurable: false,
      resource_action: { resource_type: 'DialogField', ae_attributes: {} },
      resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
      automation_type: 'embedded_automate',
    };
    const result = normaliseSubmitted(submitted, 'DialogFieldCheckBox');
    expect(result.validator_type).toBe(false);
  });
});

// values entry[0] is never coerced by the UI layer regardless of data_type

describe('normaliseSubmitted — Dropdown integer data_type values stay string', () => {
  it('entry[0] is NOT coerced to number when data_type is "integer"', () => {
    const submitted = {
      label: 'Drop',
      name: 'drop_field',
      description: '',
      dynamic: false,
      required: false,
      read_only: false,
      visible: true,
      data_type: 'integer',
      show_refresh_button: false,
      load_values_on_init: true,
      dialog_field_responders: [],
      options: {
        protected: false,
        force_multi_value: false,
        force_single_value: false,
        sort_by: 'none',
        sort_order: 'ascending',
        show_past_dates: false,
        category_id: '',
      },
      validator_type: false,
      validator_rule: '',
      validator_message: '',
      reconfigurable: false,
      resource_action: { resource_type: 'DialogField', ae_attributes: {} },
      resource_action_workflow: { resource_type: 'DialogField', ae_attributes: {} },
      automation_type: 'embedded_automate',
      values: [{ value: '1', description: 'One' }],
      values_sorted: [],
    };
    const result = normaliseSubmitted(submitted, 'DialogFieldDropDownList');
    expect(result.values).toEqual([['1', 'One']]);
    // entry[0] must stay a string, not be coerced to a number
    expect(typeof result.values[0][0]).toBe('string');
  });
});
