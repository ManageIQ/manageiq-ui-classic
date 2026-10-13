import {
  fieldComponents,
  defaultField,
  resetFieldCounters,
  seedFieldCounters,
} from '../../components/service-dialog-form/data';

beforeEach(() => resetFieldCounters());

describe('defaultField', () => {
  it('returns independent objects (no shared references between calls)', () => {
    const a = defaultField('DialogFieldTextBox');
    const b = defaultField('DialogFieldTextBox');
    a.options.protected = true;
    a.resource_action.ae_attributes.x = 1;
    expect(b.options.protected).toBe(false);
    expect(b.resource_action.ae_attributes).toEqual({});
  });

  it('uses the palette label as the default label', () => {
    fieldComponents.forEach(({ id, label }) => {
      expect(defaultField(id).label).toBe(label);
    });
  });

  it('falls back to base shape + generic name/label for an unknown type', () => {
    const f = defaultField('DialogFieldSomethingElse');
    expect(f.name).toBe('field_1');
    expect(f.label).toBe('Field');
    expect(f).not.toHaveProperty('validator_type');
    expect(f).not.toHaveProperty('values');
  });

  it('RadioButton has no force_multi_value, unlike DropDownList', () => {
    expect(defaultField('DialogFieldRadioButton').options).not.toHaveProperty('force_multi_value');
    expect(defaultField('DialogFieldDropDownList').options.force_multi_value).toBe(false);
  });
});

describe('defaultField — name generation', () => {
  it.each([
    ['DialogFieldTextBox', 'text_box_1'],
    ['DialogFieldTextAreaBox', 'text_area_box_1'],
    ['DialogFieldCheckBox', 'check_box_1'],
    ['DialogFieldDropDownList', 'dropdown_list_1'],
    ['DialogFieldRadioButton', 'radio_button_1'],
    ['DialogFieldDateControl', 'date_control_1'],
    ['DialogFieldDateTimeControl', 'date_time_control_1'],
    ['DialogFieldTagControl', 'tag_control_1'],
  ])('%s → %s on first use', (type, expected) => {
    expect(defaultField(type).name).toBe(expected);
  });

  it('increments per type independently', () => {
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_1');
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_2');
    expect(defaultField('DialogFieldCheckBox').name).toBe('check_box_1');
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_3');
  });

  it('resetFieldCounters restarts numbering', () => {
    defaultField('DialogFieldTextBox');
    defaultField('DialogFieldTextBox');
    resetFieldCounters();
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_1');
  });
});

describe('seedFieldCounters', () => {
  const dialogWith = (...fields) => ({
    dialog_tabs: [{ dialog_groups: [{ dialog_fields: fields }] }],
  });

  it('ignores a field whose name matches a different type base', () => {
    seedFieldCounters(dialogWith({ type: 'DialogFieldTextBox', name: 'check_box_4' }));
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_1');
    expect(defaultField('DialogFieldCheckBox').name).toBe('check_box_1');
  });

  it('tolerates fields without a name', () => {
    expect(() => seedFieldCounters(dialogWith({ type: 'DialogFieldTextBox' }))).not.toThrow();
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_1');
  });

  it('never lowers an already-higher counter', () => {
    seedFieldCounters(dialogWith({ type: 'DialogFieldTextBox', name: 'text_box_9' }));
    seedFieldCounters(dialogWith({ type: 'DialogFieldTextBox', name: 'text_box_2' }));
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_10');
  });

  it('handles dialogs with missing tabs / groups / fields', () => {
    expect(() => seedFieldCounters({})).not.toThrow();
    expect(() => seedFieldCounters({ dialog_tabs: [{}] })).not.toThrow();
    expect(() => seedFieldCounters({ dialog_tabs: [{ dialog_groups: [{}] }] })).not.toThrow();
  });

  it('scans across multiple tabs and sections', () => {
    seedFieldCounters({
      dialog_tabs: [
        { dialog_groups: [{ dialog_fields: [{ type: 'DialogFieldRadioButton', name: 'radio_button_2' }] }] },
        { dialog_groups: [{ dialog_fields: [{ type: 'DialogFieldRadioButton', name: 'radio_button_6' }] }] },
      ],
    });
    expect(defaultField('DialogFieldRadioButton').name).toBe('radio_button_7');
  });

  it('ignores names that only partly match <base>_<n>', () => {
    seedFieldCounters(dialogWith(
      { type: 'DialogFieldTextBox', name: 'text_box_' },
      { type: 'DialogFieldTextBox', name: 'text_box_abc' },
      { type: 'DialogFieldTextBox', name: 'xtext_box_9' },
      { type: 'DialogFieldTextBox', name: 'text_box_9x' },
    ));
    expect(defaultField('DialogFieldTextBox').name).toBe('text_box_1');
  });
});
