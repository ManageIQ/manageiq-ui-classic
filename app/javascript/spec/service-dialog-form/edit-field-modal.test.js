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
