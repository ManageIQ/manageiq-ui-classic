import {
  SD_ACTIONS,
  sortItems,
  uniqueNameValidator,
  getComponentIdFromType,
  getFieldValues,
  fieldValuesToArray,
  getRefreshEnabledFields,
  dropField,
  dropSection,
  dropTab,
  dropComponent,
  handlePropertiesEdit,
  deleteField,
  updateFieldResponders,
  deleteSection,
  deleteTab,
  defaultTab,
  defaultSection,
  buildDialogPayload,
  isSaveDisabled,
  saveDisabledReason,
} from '../../components/service-dialog-form/helper';

// seedFieldCounters — duplicate name regression

import { defaultField, seedFieldCounters, resetFieldCounters } from '../../components/service-dialog-form/data';

// Fixtures

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

// SD_ACTIONS

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

// sortItems

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

// uniqueNameValidator

describe('uniqueNameValidator', () => {
  it('returns false when name is unique', () => {
    const fieldA = makeField('field_a');
    const fieldB = makeField('field_b');
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA, fieldB])])]);
    expect(uniqueNameValidator(dialog, 'field_a', fieldA)).toBe(false);
  });

  it('returns true when another field shares the same name', () => {
    const fieldA = makeField('shared_name');
    const fieldB = makeField('shared_name'); // same name, different object identity
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA, fieldB])])]);
    expect(uniqueNameValidator(dialog, 'shared_name', fieldA)).toBe(true);
  });

  it('does not flag the field against itself', () => {
    const fieldA = makeField('solo');
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA])])]);
    expect(uniqueNameValidator(dialog, 'solo', fieldA)).toBe(false);
  });

  it('flags a new name typed into the edited field when another field already uses it', () => {
    const fieldA = makeField('field_a');
    const fieldB = makeField('field_b');
    const dialog = makeDialog([makeTab('T', [makeSection('S', [fieldA, fieldB])])]);
    expect(uniqueNameValidator(dialog, 'field_b', fieldA)).toBe(true);
  });
});

// getComponentIdFromType

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

// getFieldValues

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

// fieldValuesToArray

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

// getRefreshEnabledFields

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

// dropField (reorder field within section)

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

// dropSection (reorder section within tab)

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

// dropTab (reorder tabs)

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

// dropComponent (add field from palette)

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

// handlePropertiesEdit

describe('handlePropertiesEdit', () => {
  it('merges updatedProps into the matching field', () => {
    const dialog = sampleDialog();
    const result = handlePropertiesEdit(dialog, 0, 0, 0, { label: 'Updated Label', required: true });
    const field = result.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field.label).toBe('Updated Label');
    expect(field.required).toBe(true);
  });

  it('increments _version on update', () => {
    const dialog = sampleDialog();
    const original = dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0]._version;
    const result = handlePropertiesEdit(dialog, 0, 0, 0, { label: 'X' });
    const field = result.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(field._version).toBe(original + 1);
  });

  it('leaves other fields untouched', () => {
    const dialog = sampleDialog();
    const result = handlePropertiesEdit(dialog, 0, 0, 0, { label: 'X' });
    const fieldB = result.dialog_tabs[0].dialog_groups[0].dialog_fields[1];
    expect(fieldB.name).toBe('field_b');
    expect(fieldB.label).toBe('Label field_b');
  });

  it('edits only the field at the given position when two fields share a name', () => {
    const dialog = makeDialog([makeTab('T', [makeSection('S', [makeField('dup'), makeField('dup')])])]);
    const result = handlePropertiesEdit(dialog, 0, 0, 1, { label: 'Second' });
    const [first, second] = result.dialog_tabs[0].dialog_groups[0].dialog_fields;
    expect(first.label).toBe('Label dup');
    expect(second.label).toBe('Second');
  });

  it('returns the data unchanged for a position that does not exist', () => {
    const dialog = sampleDialog();
    const result = handlePropertiesEdit(dialog, 5, 0, 0, { label: 'X' });
    expect(result.dialog_tabs).toEqual(dialog.dialog_tabs);
  });

  it('does not mutate the original', () => {
    const dialog = sampleDialog();
    const originalLabel = dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0].label;
    handlePropertiesEdit(dialog, 0, 0, 0, { label: 'Changed' });
    expect(dialog.dialog_tabs[0].dialog_groups[0].dialog_fields[0].label).toBe(originalLabel);
  });
});

// dialog_field_responders upkeep

const respondersDialog = () => makeDialog([
  makeTab('T', [
    makeSection('S', [
      makeField('dyn', { dynamic: true, dialog_field_responders: ['target', 'other'] }),
      makeField('target'),
      makeField('other'),
    ]),
  ]),
]);

const fieldsOf = (dialog) => dialog.dialog_tabs[0].dialog_groups[0].dialog_fields;

describe('updateFieldResponders', () => {
  it('removes the name from every field that references it', () => {
    const result = updateFieldResponders(respondersDialog(), 'target');
    expect(fieldsOf(result)[0].dialog_field_responders).toEqual(['other']);
  });

  it('replaces the name when a new name is given', () => {
    const result = updateFieldResponders(respondersDialog(), 'target', 'renamed');
    expect(fieldsOf(result)[0].dialog_field_responders).toEqual(['other', 'renamed']);
  });

  it('keeps untouched fields as the same object', () => {
    const dialog = respondersDialog();
    const result = updateFieldResponders(dialog, 'target');
    expect(fieldsOf(result)[1]).toBe(fieldsOf(dialog)[1]);
  });
});

describe('handlePropertiesEdit — dialog_field_responders', () => {
  it('removes the field from other fields\' responders when it stops being dynamic', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('target', { dynamic: true }),
          makeField('dyn', { dynamic: true, dialog_field_responders: ['target', 'other'] }),
        ]),
      ]),
    ]);
    const result = handlePropertiesEdit(dialog, 0, 0, 0, { dynamic: false });
    expect(fieldsOf(result)[1].dialog_field_responders).toEqual(['other']);
  });

  it('keeps the responders when the field stays dynamic', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('target', { dynamic: true }),
          makeField('dyn', { dynamic: true, dialog_field_responders: ['target'] }),
        ]),
      ]),
    ]);
    const result = handlePropertiesEdit(dialog, 0, 0, 0, { label: 'New' });
    expect(fieldsOf(result)[1].dialog_field_responders).toEqual(['target']);
  });

  it('follows a rename in other fields\' responders', () => {
    const result = handlePropertiesEdit(respondersDialog(), 0, 0, 1, { name: 'renamed' });
    expect(fieldsOf(result)[0].dialog_field_responders).toEqual(['other', 'renamed']);
  });
});

// deleteField

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

  it('removes the deleted field from other fields\' responders', () => {
    const result = deleteField(respondersDialog(), 0, 0, 1); // remove 'target'
    expect(fieldsOf(result)[0].dialog_field_responders).toEqual(['other']);
  });

  it('keeps the responder when another field with the same name remains', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [
          makeField('dyn', { dynamic: true, dialog_field_responders: ['twin'] }),
          makeField('twin'),
        ]),
        makeSection('S2', [makeField('twin')]),
      ]),
    ]);
    const result = deleteField(dialog, 0, 0, 1);
    expect(fieldsOf(result)[0].dialog_field_responders).toEqual(['twin']);
  });
});

// deleteSection

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

// deleteTab

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

// defaultTab / defaultSection

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

// buildDialogPayload — CREATE

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

// buildDialogPayload — EDIT

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

// buildDialogPayload — COPY (strips IDs)

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

  it('strips tab id and group id for copy — regression for PG::UniqueViolation', () => {
    const dialog = makeDialog([
      makeTab('T', [
        makeSection('S', [makeField('f')]),
      ]),
    ]);
    // Inject DB ids on tab and group as they would exist when copying an existing dialog
    dialog.dialog_tabs[0].id = 5;
    dialog.dialog_tabs[0].dialog_groups[0].id = 10;
    const payload = buildDialogPayload(dialog, 'copy');
    expect(payload.resource.dialog_tabs[0].id).toBeUndefined();
    expect(payload.resource.dialog_tabs[0].dialog_groups[0].id).toBeUndefined();
  });

  it('strips resource_action id for copy but keeps it for edit', () => {
    const resourceAction = {
      id: 99, resource_type: 'DialogField', ae_namespace: 'a', ae_class: 'b', ae_instance: 'c', ae_attributes: {},
    };
    const dialog = makeDialog([
      makeTab('T', [makeSection('S', [makeField('f', { id: 7, dynamic: true, resource_action: resourceAction })])]),
    ]);
    const copied = buildDialogPayload(dialog, 'copy').resource.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(copied.resource_action.id).toBeUndefined();
    expect(copied.resource_action.ae_instance).toBe('c');

    const edited = buildDialogPayload(dialog, 'edit').resource.content.dialog_tabs[0].dialog_groups[0].dialog_fields[0];
    expect(edited.resource_action.id).toBe(99);
  });
});

describe('seedFieldCounters', () => {
  beforeEach(() => {
    resetFieldCounters();
  });

  it('next generated name does not collide with existing field names after seeding', () => {
    const existingDialog = {
      dialog_tabs: [{
        dialog_groups: [{
          dialog_fields: [
            { name: 'text_box_1', type: 'DialogFieldTextBox' },
            { name: 'dropdown_list_1', type: 'DialogFieldDropDownList' },
          ],
        }],
      }],
    };

    seedFieldCounters(existingDialog);

    const newTextBox = defaultField('DialogFieldTextBox');
    const newDropdown = defaultField('DialogFieldDropDownList');

    expect(newTextBox.name).toBe('text_box_2');
    expect(newDropdown.name).toBe('dropdown_list_2');
  });

  it('handles non-sequential existing names — uses highest number found', () => {
    const existingDialog = {
      dialog_tabs: [{
        dialog_groups: [{
          dialog_fields: [
            { name: 'text_box_3', type: 'DialogFieldTextBox' },
            { name: 'text_box_1', type: 'DialogFieldTextBox' },
          ],
        }],
      }],
    };

    seedFieldCounters(existingDialog);

    const newTextBox = defaultField('DialogFieldTextBox');
    expect(newTextBox.name).toBe('text_box_4');
  });

  it('ignores custom field names that do not match the generated pattern', () => {
    const existingDialog = {
      dialog_tabs: [{
        dialog_groups: [{
          dialog_fields: [
            { name: 'my_custom_field', type: 'DialogFieldTextBox' },
          ],
        }],
      }],
    };

    seedFieldCounters(existingDialog);

    // Counter for text_box was never seeded — starts fresh at 1
    const newTextBox = defaultField('DialogFieldTextBox');
    expect(newTextBox.name).toBe('text_box_1');
  });
});

// uniqueNameValidator — cross-tab / cross-section duplicate detection

describe('uniqueNameValidator — cross-structure', () => {
  it('detects a duplicate name across different tabs', () => {
    const fieldA = makeField('shared_name');
    const fieldB = makeField('shared_name');
    const dialog = makeDialog([
      makeTab('T1', [makeSection('S1', [fieldA])]),
      makeTab('T2', [makeSection('S2', [fieldB])]),
    ]);
    expect(uniqueNameValidator(dialog, 'shared_name', fieldA)).toBe(true);
  });

  it('detects a duplicate name across different sections in the same tab', () => {
    const fieldA = makeField('shared_name');
    const fieldB = makeField('shared_name');
    const dialog = makeDialog([
      makeTab('T', [makeSection('S1', [fieldA]), makeSection('S2', [fieldB])]),
    ]);
    expect(uniqueNameValidator(dialog, 'shared_name', fieldA)).toBe(true);
  });

  it('returns false when names are unique across all tabs and sections', () => {
    const fieldA = makeField('alpha');
    const fieldB = makeField('beta');
    const dialog = makeDialog([
      makeTab('T1', [makeSection('S1', [fieldA])]),
      makeTab('T2', [makeSection('S2', [fieldB])]),
    ]);
    expect(uniqueNameValidator(dialog, 'alpha', fieldA)).toBe(false);
  });
});

// isSaveDisabled — all sub-conditions

describe('isSaveDisabled', () => {
  const field = makeField('f1');
  const section = makeSection('Section', [field]);
  const tab = makeTab('Tab', [section]);

  it('is true when data is null', () => {
    expect(isSaveDisabled(null)).toBe(true);
  });

  it('is true when data is undefined', () => {
    expect(isSaveDisabled(undefined)).toBe(true);
  });

  it('is true when dialog label is empty', () => {
    const dialog = { ...makeDialog([tab]), label: '' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when dialog label is whitespace only', () => {
    const dialog = { ...makeDialog([tab]), label: '   ' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when there are no tabs', () => {
    const dialog = { ...makeDialog([]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when a tab has an empty label', () => {
    const emptyLabelTab = { ...tab, label: '' };
    const dialog = { ...makeDialog([emptyLabelTab]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when a tab has no sections', () => {
    const emptyTab = makeTab('Tab', []);
    const dialog = { ...makeDialog([emptyTab]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when a section has an empty label', () => {
    const emptyLabelSection = { ...section, label: '' };
    const tabWithIt = makeTab('Tab', [emptyLabelSection]);
    const dialog = { ...makeDialog([tabWithIt]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when a section has no fields', () => {
    const emptySection = makeSection('Section', []);
    const tabWithIt = makeTab('Tab', [emptySection]);
    const dialog = { ...makeDialog([tabWithIt]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is false when label + at least one field per section', () => {
    const dialog = { ...makeDialog([tab]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(false);
  });

  it('is false with multiple tabs and sections each having fields', () => {
    const field2 = makeField('f2');
    const section2 = makeSection('Section 2', [field2]);
    const tab2 = makeTab('Tab 2', [section2]);
    const dialog = { ...makeDialog([tab, tab2]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(false);
  });

  it('is true when only the second tab has an empty section', () => {
    const tab2 = makeTab('Tab 2', [makeSection('S2', [])]);
    const dialog = { ...makeDialog([tab, tab2]), label: 'My Dialog' };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when two fields share the same name', () => {
    const dialog = {
      ...makeDialog([makeTab('Tab', [makeSection('S', [makeField('a'), makeField('a')])])]),
      label: 'My Dialog',
    };
    expect(isSaveDisabled(dialog)).toBe(true);
  });

  it('is true when duplicate names are in different tabs', () => {
    const dialog = {
      ...makeDialog([
        makeTab('T1', [makeSection('S1', [makeField('a')])]),
        makeTab('T2', [makeSection('S2', [makeField('a')])]),
      ]),
      label: 'My Dialog',
    };
    expect(isSaveDisabled(dialog)).toBe(true);
  });
});

describe('saveDisabledReason', () => {
  const field = makeField('f1');
  const tab = makeTab('Tab', [makeSection('Section', [field])]);
  const valid = { ...makeDialog([tab]), label: 'My Dialog' };

  it('is null when the dialog can be saved', () => {
    expect(saveDisabledReason(valid)).toBeNull();
  });

  it('explains each failing condition', () => {
    expect(saveDisabledReason(null)).toBe('The dialog has not loaded yet');
    expect(saveDisabledReason({ ...valid, label: ' ' })).toBe('Enter a label for the dialog');
    expect(saveDisabledReason({ ...makeDialog([]), label: 'D' })).toBe('Add at least one tab');
    expect(saveDisabledReason({ ...makeDialog([{ ...tab, label: '' }]), label: 'D' })).toBe('Every tab needs a label');
    expect(saveDisabledReason({ ...makeDialog([makeTab('T1', [])]), label: 'D' })).toBe('Tab "T1" needs at least one section');
    expect(saveDisabledReason({ ...makeDialog([makeTab('T1', [makeSection('', [field])])]), label: 'D' }))
      .toBe('Every section in tab "T1" needs a label');
    expect(saveDisabledReason({ ...makeDialog([makeTab('T1', [makeSection('S1', [])])]), label: 'D' }))
      .toBe('Section "S1" needs at least one field');
  });

  it('names the first duplicated field', () => {
    const dup = { ...makeDialog([makeTab('T', [makeSection('S', [makeField('a'), makeField('b'), makeField('b')])])]), label: 'D' };
    expect(saveDisabledReason(dup)).toBe('Field names must be unique, "b" is used more than once');
  });

  it('agrees with isSaveDisabled', () => {
    expect(isSaveDisabled(valid)).toBe(saveDisabledReason(valid) !== null);
    expect(isSaveDisabled({ ...valid, label: '' })).toBe(true);
  });
});
