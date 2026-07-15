import {
  SD_ACTIONS,
  sortItems,
  uniqueNameValidator,
  getComponentIdFromType,
  getFieldValues,
  fieldValuesToArray,
  getCurrentTimeAndPeriod,
  getRefreshEnabledFields,
  dropField,
  dropSection,
  dropTab,
  dropComponent,
  handlePropertiesEdit,
  deleteField,
  deleteSection,
  deleteTab,
  defaultTab,
  defaultSection,
  buildDialogPayload,
} from '../../components/service-dialog-form/helper';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeField = (name, extra = {}) => ({
  name,
  label: `Label ${name}`,
  type: 'DialogFieldTextBox',
  description: '',
  display: 'edit',
  display_method_options: {},
  read_only: false,
  required: false,
  required_method_options: {},
  default_value: '',
  values_method_options: {},
  position: 0,
  dynamic: false,
  show_refresh_button: false,
  load_values_on_init: true,
  auto_refresh: false,
  trigger_auto_refresh: false,
  reconfigurable: false,
  visible: true,
  options: { protected: false },
  resource_action: { resource_type: 'DialogField', ae_attributes: {} },
  _version: 1,
  ...extra,
});

const makeSection = (label, fields = [], position = 0) => ({
  label,
  description: '',
  position,
  dialog_fields: fields,
});

const makeTab = (label, sections = [], position = 0) => ({
  label,
  description: '',
  position,
  dialog_groups: sections,
});

const makeDialog = (tabs = []) => ({
  label: 'My Dialog',
  description: 'desc',
  dialog_tabs: tabs,
});

// A reusable dialog with one tab → one section → two fields
const sampleDialog = () =>
  makeDialog([
    makeTab('Tab 1', [
      makeSection('Sec 1', [
        makeField('field_a', { position: 0 }),
        makeField('field_b', { position: 1 }),
      ]),
    ]),
  ]);

// ---------------------------------------------------------------------------
// SD_ACTIONS
// ---------------------------------------------------------------------------

describe('SD_ACTIONS', () => {
  it('has correct tab action keys', () => {
    expect(SD_ACTIONS.tab).toEqual({
      add: 'tab.add',
      delete: 'tab.delete',
      edit: 'tab.edit',
      reorder: 'tab.reorder',
    });
  });

  it('has correct section action keys', () => {
    expect(SD_ACTIONS.section).toEqual({
      add: 'section.add',
      delete: 'section.delete',
      edit: 'section.edit',
      reorder: 'section.reorder',
    });
  });

  it('has correct field action keys', () => {
    expect(SD_ACTIONS.field).toEqual({
      add: 'field.add',
      delete: 'field.delete',
      edit: 'field.edit',
      reorder: 'field.reorder',
    });
  });
});

// ---------------------------------------------------------------------------
// sortItems
// ---------------------------------------------------------------------------

describe('sortItems', () => {
  it('sorts by position ascending', () => {
    const items = [
      { position: 2, label: 'c' },
      { position: 0, label: 'a' },
      { position: 1, label: 'b' },
    ];
    const result = sortItems(items);
    expect(result.map((i) => i.label)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the original array', () => {
    const items = [{ position: 1 }, { position: 0 }];
    sortItems(items);
    expect(items[0].position).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// uniqueNameValidator
// ---------------------------------------------------------------------------

describe('uniqueNameValidator', () => {
  it('returns false when name is unique', () => {
    const fieldA = makeField('field_a');
    const fieldB = makeField('field_b');
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA, fieldB])])]);
    expect(uniqueNameValidator(dialog, fieldA)).toBe(false);
  });

  it('returns true when another field shares the same name', () => {
    const fieldA = makeField('shared_name');
    const fieldB = makeField('shared_name'); // same name, different object identity
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA, fieldB])])]);
    expect(uniqueNameValidator(dialog, fieldA)).toBe(true);
  });

  it('does not flag the field against itself', () => {
    const fieldA = makeField('solo');
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA])])]);
    expect(uniqueNameValidator(dialog, fieldA)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getComponentIdFromType
// ---------------------------------------------------------------------------

describe('getComponentIdFromType', () => {
  const cases = [
    ['DialogFieldTextBox', 'text-box'],
    ['DialogFieldTextAreaBox', 'text-area'],
    ['DialogFieldCheckBox', 'check-box'],
    ['DialogFieldDropDownList', 'dropdown'],
    ['DialogFieldRadioButton', 'radio-button'],
    ['DialogFieldDateControl', 'date-picker'],
    ['DialogFieldDateTimeControl', 'time-picker'],
    ['DialogFieldTagControl', 'tag-control'],
  ];

  test.each(cases)('%s → %s', (type, expected) => {
    expect(getComponentIdFromType(type)).toBe(expected);
  });

  it('falls back to text-box for unknown types', () => {
    expect(getComponentIdFromType('DialogFieldUnknown')).toBe('text-box');
  });
});

// ---------------------------------------------------------------------------
// getFieldValues
// ---------------------------------------------------------------------------

describe('getFieldValues', () => {
  it('converts [[value, description], ...] arrays to objects', () => {
    const field = { values: [['1', 'One'], ['2', 'Two']] };
    expect(getFieldValues(field)).toEqual([
      { value: '1', description: 'One' },
      { value: '2', description: 'Two' },
    ]);
  });

  it('passes through already-object values unchanged', () => {
    const field = { values: [{ value: '1', description: 'One' }] };
    expect(getFieldValues(field)).toEqual([{ value: '1', description: 'One' }]);
  });

  it('returns [] when values is not an array', () => {
    expect(getFieldValues({ values: null })).toEqual([]);
    expect(getFieldValues({ values: undefined })).toEqual([]);
    expect(getFieldValues({})).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// fieldValuesToArray
// ---------------------------------------------------------------------------

describe('fieldValuesToArray', () => {
  it('converts objects to [[value, description], ...] arrays', () => {
    const values = [{ value: '1', description: 'One' }, { value: '2', description: 'Two' }];
    expect(fieldValuesToArray(values)).toEqual([['1', 'One'], ['2', 'Two']]);
  });

  it('passes through already-array pairs unchanged', () => {
    const values = [['1', 'One'], ['2', 'Two']];
    expect(fieldValuesToArray(values)).toEqual([['1', 'One'], ['2', 'Two']]);
  });

  it('returns [] when values is not an array', () => {
    expect(fieldValuesToArray(null)).toEqual([]);
    expect(fieldValuesToArray(undefined)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getCurrentTimeAndPeriod
// ---------------------------------------------------------------------------

describe('getCurrentTimeAndPeriod', () => {
  it('returns hour, minute, and period', () => {
    const result = getCurrentTimeAndPeriod();
    expect(result).toHaveProperty('hour');
    expect(result).toHaveProperty('minute');
    expect(result).toHaveProperty('period');
  });

  it('period is AM or PM', () => {
    expect(['AM', 'PM']).toContain(getCurrentTimeAndPeriod().period);
  });

  it('hour is zero-padded string between 01 and 12', () => {
    const { hour } = getCurrentTimeAndPeriod();
    const num = parseInt(hour, 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(12);
    expect(hour).toMatch(/^\d{2}$/);
  });

  it('minute is zero-padded string between 00 and 59', () => {
    const { minute } = getCurrentTimeAndPeriod();
    const num = parseInt(minute, 10);
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThanOrEqual(59);
    expect(minute).toMatch(/^\d{2}$/);
  });
});

// ---------------------------------------------------------------------------
// getRefreshEnabledFields
// ---------------------------------------------------------------------------

describe('getRefreshEnabledFields', () => {
  it('returns dynamic fields excluding the named field', () => {
    const dynField = makeField('dyn_1', { dynamic: true });
    const staticField = makeField('static_1', { dynamic: false });
    const selfField = makeField('self', { dynamic: true });
    const dialog = makeDialog([makeTab('T', [makeSection('S', [dynField, staticField, selfField])])]);

    const result = getRefreshEnabledFields(dialog, 'self');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('dyn_1');
  });

  it('returns empty array when no dynamic fields exist', () => {
    const dialog = sampleDialog(); // all static
    expect(getRefreshEnabledFields(dialog, 'field_a')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// dropField (reorder field within section)
// ---------------------------------------------------------------------------

describe('dropField', () => {
  it('moves a field from index 0 to index 1 and reassigns positions', () => {
    const dialog = sampleDialog();
    const result = dropField(dialog, 0, 0, 0, 1);
    const fields = result.dialog_tabs[0].dialog_groups[0].dialog_fields;
    expect(fields[0].name).toBe('field_b');
    expect(fields[1].name).toBe('field_a');
    expect(fields[0].position).toBe(0);
    expect(fields[1].position).toBe(1);
  });

  it('does not mutate the original data', () => {
    const dialog = sampleDialog();
    const original = dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0].name;
    dropField(dialog, 0, 0, 0, 1);
    expect(dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0].name).toBe(original);
  });
});

// ---------------------------------------------------------------------------
// dropSection (reorder section within tab)
// ---------------------------------------------------------------------------

describe('dropSection', () => {
  it('moves section from index 0 to index 1', () => {
    const dialog = makeDialog([
      makeTab('Tab 1', [
        makeSection('Sec A', [], 0),
        makeSection('Sec B', [], 1),
      ]),
    ]);
    const result = dropSection(dialog, 0, 0, 1);
    const groups = result.dialog_tabs[0].dialog_groups;
    expect(groups[0].label).toBe('Sec B');
    expect(groups[1].label).toBe('Sec A');
    expect(groups[0].position).toBe(0);
    expect(groups[1].position).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// dropTab (reorder tabs)
// ---------------------------------------------------------------------------

describe('dropTab', () => {
  it('moves tab from index 0 to index 1', () => {
    const dialog = makeDialog([
      makeTab('Tab A', [], 0),
      makeTab('Tab B', [], 1),
    ]);
    const result = dropTab(dialog, 0, 1);
    expect(result.dialog_tabs[0].label).toBe('Tab B');
    expect(result.dialog_tabs[1].label).toBe('Tab A');
    expect(result.dialog_tabs[0].position).toBe(0);
    expect(result.dialog_tabs[1].position).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// dropComponent (add field from palette)
// ---------------------------------------------------------------------------

describe('dropComponent', () => {
  it('appends a new field to the target section', () => {
    const dialog = makeDialog([makeTab('Tab 1', [makeSection('Sec 1', [])])]);
    const mockDefaultField = jest.fn((type, pos) => makeField('new_field', { type, position: pos }));

    const result = dropComponent(dialog, 0, 0, 'DialogFieldTextBox', mockDefaultField);
    const fields = result.dialog_tabs[0].dialog_groups[0].dialog_fields;
    expect(fields).toHaveLength(1);
    expect(mockDefaultField).toHaveBeenCalledWith('DialogFieldTextBox', 0);
  });
});

// ---------------------------------------------------------------------------
// handlePropertiesEdit
// ---------------------------------------------------------------------------

describe('handlePropertiesEdit', () => {
  it('merges updatedProps into the matching field', () => {
    const dialog = sampleDialog();
    const result = handlePropertiesEdit(dialog, 'field_a', { label: 'Updated Label', required: true });
    const field = result.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field.label).toBe('Updated Label');
    expect(field.required).toBe(true);
  });

  it('increments _version on update', () => {
    const dialog = sampleDialog();
    const original = dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0]._version;
    const result = handlePropertiesEdit(dialog, 'field_a', { label: 'X' });
    const field = result.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field._version).toBe(original + 1);
  });

  it('leaves other fields untouched', () => {
    const dialog = sampleDialog();
    const result = handlePropertiesEdit(dialog, 'field_a', { label: 'X' });
    const fieldB = result.dialog_tabs[0].dialog_groups[0].dialog_fields[1];
    expect(fieldB.name).toBe('field_b');
    expect(fieldB.label).toBe('Label field_b');
  });

  it('does not mutate the original', () => {
    const dialog = sampleDialog();
    const originalLabel = dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0].label;
    handlePropertiesEdit(dialog, 'field_a', { label: 'Changed' });
    expect(dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0].label).toBe(originalLabel);
  });
});

// ---------------------------------------------------------------------------
// deleteField
// ---------------------------------------------------------------------------

describe('deleteField', () => {
  it('removes the field at the given index', () => {
    const dialog = sampleDialog();
    const result = deleteField(dialog, 0, 0, 0);
    const fields = result.dialog_tabs[0].dialog_groups[0].dialog_fields;
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe('field_b');
  });

  it('reassigns positions after deletion', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('a', { position: 0 }),
          makeField('b', { position: 1 }),
          makeField('c', { position: 2 }),
        ]),
      ]),
    ]);
    const result = deleteField(dialog, 0, 0, 1); // remove 'b'
    const fields = result.dialog_tabs[0].dialog_groups[0].dialog_fields;
    expect(fields.map((f) => f.position)).toEqual([0, 1]);
    expect(fields.map((f) => f.name)).toEqual(['a', 'c']);
  });
});

// ---------------------------------------------------------------------------
// deleteSection
// ---------------------------------------------------------------------------

describe('deleteSection', () => {
  it('removes the section at the given index', () => {
    const dialog = makeDialog([
      makeTab('T', [makeSection('Sec A'), makeSection('Sec B')]),
    ]);
    const result = deleteSection(dialog, 0, 0);
    expect(result.dialog_tabs[0].dialog_groups).toHaveLength(1);
    expect(result.dialog_tabs[0].dialog_groups[0].label).toBe('Sec B');
  });

  it('reassigns positions after deletion', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('A', [], 0),
        makeSection('B', [], 1),
        makeSection('C', [], 2),
      ]),
    ]);
    const result = deleteSection(dialog, 0, 1); // remove 'B'
    const positions = result.dialog_tabs[0].dialog_groups.map((g) => g.position);
    expect(positions).toEqual([0, 1]);
  });
});

// ---------------------------------------------------------------------------
// deleteTab
// ---------------------------------------------------------------------------

describe('deleteTab', () => {
  it('removes the tab at the given index', () => {
    const dialog = makeDialog([makeTab('Tab A'), makeTab('Tab B')]);
    const result = deleteTab(dialog, 0);
    expect(result.dialog_tabs).toHaveLength(1);
    expect(result.dialog_tabs[0].label).toBe('Tab B');
  });

  it('reassigns positions after deletion', () => {
    const dialog = makeDialog([makeTab('A', [], 0), makeTab('B', [], 1), makeTab('C', [], 2)]);
    const result = deleteTab(dialog, 1); // remove 'B'
    expect(result.dialog_tabs.map((t) => t.position)).toEqual([0, 1]);
    expect(result.dialog_tabs.map((t) => t.label)).toEqual(['A', 'C']);
  });
});

// ---------------------------------------------------------------------------
// defaultTab / defaultSection
// ---------------------------------------------------------------------------

describe('defaultTab', () => {
  it('creates a tab with position and one default section', () => {
    const tab = defaultTab(2);
    expect(tab.position).toBe(2);
    expect(tab.dialog_groups).toHaveLength(1);
    expect(tab.label).toBe(__('New Tab'));
  });
});

describe('defaultSection', () => {
  it('creates a section with position and empty fields', () => {
    const sec = defaultSection(1);
    expect(sec.position).toBe(1);
    expect(sec.dialog_fields).toEqual([]);
    expect(sec.label).toBe(__('New Section'));
  });
});

// ---------------------------------------------------------------------------
// buildDialogPayload — CREATE
// ---------------------------------------------------------------------------

describe('buildDialogPayload (create)', () => {
  it('produces action=create with resource.dialog_tabs at top level', () => {
    const dialog = sampleDialog();
    const payload = buildDialogPayload(dialog, 'create');
    expect(payload.action).toBe('create');
    expect(payload.resource.buttons).toBe('submit,cancel');
    expect(Array.isArray(payload.resource.dialog_tabs)).toBe(true);
    expect(payload.resource.content).toBeUndefined();
  });

  it('strips _version from fields', () => {
    const dialog = sampleDialog();
    const payload = buildDialogPayload(dialog, 'create');
    const field = payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field._version).toBeUndefined();
  });

  it('strips automation_type and dynamicFieldList from fields', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('f', { automation_type: 'embedded_automate', dynamicFieldList: [] }),
        ]),
      ]),
    ]);
    const payload = buildDialogPayload(dialog, 'create');
    const field = payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field.automation_type).toBeUndefined();
    expect(field.dynamicFieldList).toBeUndefined();
  });

  it('strips workflow_name from resource_action', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('f', {
            resource_action: {
              resource_type: 'DialogField',
              ae_attributes: {},
              workflow_name: 'My Workflow',
              configuration_script_id: 42,
            },
          }),
        ]),
      ]),
    ]);
    const payload = buildDialogPayload(dialog, 'create');
    const ra = payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0].resource_action;
    expect(ra.workflow_name).toBeUndefined();
    expect(ra.configuration_script_id).toBe(42);
  });

  it('reassigns position index from loop', () => {
    const dialog = sampleDialog();
    const payload = buildDialogPayload(dialog, 'create');
    const fields = payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields;
    expect(fields[0].position).toBe(0);
    expect(fields[1].position).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildDialogPayload — EDIT
// ---------------------------------------------------------------------------

describe('buildDialogPayload (edit)', () => {
  it('produces action=edit with resource.content.dialog_tabs', () => {
    const dialog = sampleDialog();
    const payload = buildDialogPayload(dialog, 'edit');
    expect(payload.action).toBe('edit');
    expect(payload.resource.content).toBeDefined();
    expect(Array.isArray(payload.resource.content.dialog_tabs)).toBe(true);
    expect(payload.resource.dialog_tabs).toBeUndefined();
  });

  it('does NOT include buttons for edit', () => {
    const dialog = sampleDialog();
    const payload = buildDialogPayload(dialog, 'edit');
    expect(payload.resource.buttons).toBeUndefined();
  });

  it('preserves existing tab and group ids', () => {
    const dialog = makeDialog([
      { ...makeTab('T'), id: 5, dialog_groups: [{ ...makeSection('S'), id: 10, dialog_fields: [] }] },
    ]);
    const payload = buildDialogPayload(dialog, 'edit');
    expect(payload.resource.content.dialog_tabs[0].id).toBe(5);
    expect(payload.resource.content.dialog_tabs[0].dialog_groups[0].id).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// buildDialogPayload — COPY (strips IDs)
// ---------------------------------------------------------------------------

describe('buildDialogPayload (copy)', () => {
  it('produces action=create (copy is create)', () => {
    const dialog = sampleDialog();
    const payload = buildDialogPayload(dialog, 'copy');
    expect(payload.action).toBe('create');
  });

  it('strips field id and dialog_group_id for copy', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('f', { id: 99, dialog_group_id: 10 }),
        ]),
      ]),
    ]);
    const payload = buildDialogPayload(dialog, 'copy');
    const field = payload.resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field.id).toBeUndefined();
    expect(field.dialog_group_id).toBeUndefined();
  });
});
