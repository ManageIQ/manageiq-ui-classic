// Action constants
export const SD_ACTIONS = {
  tab: {
    add: 'tab.add',
    delete: 'tab.delete',
    edit: 'tab.edit',
    reorder: 'tab.reorder',
  },
  section: {
    add: 'section.add',
    delete: 'section.delete',
    edit: 'section.edit',
    reorder: 'section.reorder',
  },
  field: {
    add: 'field.add',
    delete: 'field.delete',
    edit: 'field.edit',
    reorder: 'field.reorder',
  },
};

// Sort helper
export const sortItems = (items) =>
  [...items].sort((a, b) => a.position - b.position);

const getAllFields = (dialogData) => {
  const fields = [];
  (dialogData.dialog_tabs || []).forEach((tab) => {
    (tab.dialog_groups || []).forEach((group) => {
      (group.dialog_fields || []).forEach((field) => {
        fields.push(field);
      });
    });
  });
  return fields;
};

// Unique field name validator
// Returns true if `name` is already used by a field in the dialog other than `excludeField`
// (compared by object identity, so the field being edited does not clash with itself).
export const uniqueNameValidator = (dialogData, name, excludeField) =>
  getAllFields(dialogData).some((f) => f !== excludeField && f.name === name);

// Returns the first field name used by more than one field in the dialog, or undefined
const firstDuplicateFieldName = (data) => {
  const seen = new Set();
  return getAllFields(data).map((f) => f.name).find((name) => {
    if (seen.has(name)) {
      return true;
    }
    seen.add(name);
    return false;
  });
};

// Reorder / immutable array helpers
const moveItem = (arr, fromIndex, toIndex) => {
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((item, index) => ({ ...item, position: index }));
};

// Drop handlers

// Drop a new component from the palette into a section
export const dropComponent = (data, tabIndex, sectionIndex, fieldType, defaultField) => {
  const tabs = [...data.dialog_tabs];
  const tab = { ...tabs[tabIndex] };
  const groups = [...tab.dialog_groups];
  const group = { ...groups[sectionIndex] };
  const fields = [...(group.dialog_fields || [])];

  const newField = defaultField(fieldType, fields.length);
  fields.push(newField);

  group.dialog_fields = fields;
  groups[sectionIndex] = group;
  tab.dialog_groups = groups;
  tabs[tabIndex] = tab;

  return { ...data, dialog_tabs: tabs };
};

// Reorder a field within a section
export const dropField = (data, tabIndex, sectionIndex, fromIndex, toIndex) => {
  const tabs = [...data.dialog_tabs];
  const tab = { ...tabs[tabIndex] };
  const groups = [...tab.dialog_groups];
  const group = { ...groups[sectionIndex] };

  group.dialog_fields = moveItem(group.dialog_fields || [], fromIndex, toIndex);
  groups[sectionIndex] = group;
  tab.dialog_groups = groups;
  tabs[tabIndex] = tab;

  return { ...data, dialog_tabs: tabs };
};

// Reorder a section within a tab
export const dropSection = (data, tabIndex, fromIndex, toIndex) => {
  const tabs = [...data.dialog_tabs];
  const tab = { ...tabs[tabIndex] };

  tab.dialog_groups = moveItem(tab.dialog_groups || [], fromIndex, toIndex);
  tabs[tabIndex] = tab;

  return { ...data, dialog_tabs: tabs };
};

// Reorder tabs
export const dropTab = (data, fromIndex, toIndex) => {
  const tabs = moveItem(data.dialog_tabs || [], fromIndex, toIndex);
  return { ...data, dialog_tabs: tabs };
};

// Refresh-enabled fields
// Returns all dynamic fields excluding the one with name=excludeName
export const getRefreshEnabledFields = (data, excludeName) => {
  const fields = getAllFields(data);
  return fields.filter((f) => f.dynamic && f.name !== excludeName);
};

// componentId → field type mapping
export const getComponentIdFromType = (type) => {
  const map = {
    DialogFieldTextBox: 'text-box',
    DialogFieldTextAreaBox: 'text-area',
    DialogFieldCheckBox: 'check-box',
    DialogFieldDropDownList: 'dropdown',
    DialogFieldRadioButton: 'radio-button',
    DialogFieldDateControl: 'date-picker',
    DialogFieldDateTimeControl: 'time-picker',
    DialogFieldTagControl: 'tag-control',
  };
  return map[type] || 'text-box';
};

// Field values normalisation — converts [[value, description], ...] arrays to/from objects
export const getFieldValues = (field) => {
  if (!Array.isArray(field.values)) {
    return [];
  }
  return field.values.map((v) => {
    if (Array.isArray(v)) {
      return { value: v[0], description: v[1] };
    }
    return v;
  });
};

export const fieldValuesToArray = (values) => {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((v) => {
    if (Array.isArray(v)) {
      return v;
    }
    return [v.value, v.description];
  });
};

// Date helpers for DatePicker / DateTimePicker canvas widgets
//
// Carbon's DatePicker (flatpickr) expects value as [Date] — not a raw string.
// Parse date parts directly to avoid UTC→local timezone shift.
// Handles both formats:
//   'YYYY-MM-DD' / 'YYYY-MM-DDT...' — ISO/API format
//   'MM/dd/yyyy'                     — legacy stored format
//
// For DateTimeControl, default_value is stored as 'YYYY-MM-DD HH:MM'.
// isoToDatePickerValue always operates on the date portion only.

export const isoToDatePickerValue = (iso) => {
  if (!iso) {
    return [];
  }
  // Strip any time portion before parsing the date
  const datePart = iso.split(' ')[0];
  // Legacy stored format: 'MM/dd/yyyy'
  if (datePart.includes('/')) {
    const [mo, dy, yr] = datePart.split('/').map(Number);
    if (mo && dy && yr) {
      return [new Date(yr, mo - 1, dy)];
    }
    return [];
  }
  // ISO format: 'YYYY-MM-DD' or 'YYYY-MM-DDThh:mm:ssZ'
  const [y, m, d] = datePart.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) {
    return [];
  }
  return [new Date(y, m - 1, d)];
};

// Extract the time string ('HH:MM') from a DateTime default_value, or '' if absent.
export const extractTimeFromDateTime = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  const parts = value.split(' ');
  return parts.length >= 2 ? parts[1] : '';
};

// Combine a 'YYYY-MM-DD' date string and 'HH:MM' time string into 'YYYY-MM-DD HH:MM'.
// If no time is provided, returns the date string alone.
export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr) {
    return '';
  }
  if (!timeStr) {
    return dateStr;
  }
  return `${dateStr} ${timeStr}`;
};

export const findFieldByName = (data, fieldName) => {
  let found;
  (data.dialog_tabs || []).forEach((tab) => (tab.dialog_groups || []).forEach((group) => (
    (group.dialog_fields || []).forEach((field) => {
      if (!found && field.name === fieldName) {
        found = field;
      }
    })
  )));
  return found;
};

// Replaces `oldName` in every field's dialog_field_responders with `newName`,
// or removes it when `newName` is not given. Fields that do not reference `oldName` are left untouched.
export const updateFieldResponders = (data, oldName, newName) => ({
  ...data,
  dialog_tabs: (data.dialog_tabs || []).map((tab) => ({
    ...tab,
    dialog_groups: (tab.dialog_groups || []).map((group) => ({
      ...group,
      dialog_fields: (group.dialog_fields || []).map((field) => {
        const responders = field.dialog_field_responders;
        if (!responders || !responders.includes(oldName)) {
          return field;
        }
        const remaining = responders.filter((name) => name !== oldName);
        return {
          ...field,
          dialog_field_responders: newName && !remaining.includes(newName) ? [...remaining, newName] : remaining,
        };
      }),
    })),
  })),
});

// Merges updatedProps into the field at the given position
const handleFieldEdit = (data, tabIndex, sectionIndex, fieldIndex, updatedProps) => ({
  ...data,
  dialog_tabs: data.dialog_tabs.map((tab, ti) => (ti !== tabIndex ? tab : {
    ...tab,
    dialog_groups: (tab.dialog_groups || []).map((group, si) => (si !== sectionIndex ? group : {
      ...group,
      dialog_fields: (group.dialog_fields || []).map((field, fi) => (fi !== fieldIndex ? field : {
        ...field,
        ...updatedProps,
        _version: (field._version || 1) + 1,
      })),
    })),
  })),
});

// Properties edit (immutable update)
// Merges updatedProps into the field at tabIndex / sectionIndex / fieldIndex. Fields are addressed by
// position rather than name, so two fields that share a name are edited independently.
// Keeps other fields' dialog_field_responders consistent when the field stops being dynamic or is renamed.
export const handlePropertiesEdit = (data, tabIndex, sectionIndex, fieldIndex, updatedProps) => {
  const before = (((data.dialog_tabs[tabIndex] || {}).dialog_groups || [])[sectionIndex] || {}).dialog_fields?.[fieldIndex];
  const edited = handleFieldEdit(data, tabIndex, sectionIndex, fieldIndex, updatedProps);
  if (!before) {
    return edited;
  }
  if (before.dynamic && updatedProps.dynamic === false) {
    return updateFieldResponders(edited, before.name);
  }
  if (updatedProps.name && updatedProps.name !== before.name) {
    return updateFieldResponders(edited, before.name, updatedProps.name);
  }
  return edited;
};

// Delete helpers
const removeFieldAt = (data, tabIndex, sectionIndex, fieldIndex) => {
  const tabs = [...data.dialog_tabs];
  const tab = { ...tabs[tabIndex] };
  const groups = [...tab.dialog_groups];
  const group = { ...groups[sectionIndex] };
  const fields = [...(group.dialog_fields || [])];

  fields.splice(fieldIndex, 1);
  group.dialog_fields = fields.map((f, i) => ({ ...f, position: i }));
  groups[sectionIndex] = group;
  tab.dialog_groups = groups;
  tabs[tabIndex] = tab;

  return { ...data, dialog_tabs: tabs };
};

// Deletes the field and drops its name from other fields' dialog_field_responders,
// unless another field with the same name remains.
export const deleteField = (data, tabIndex, sectionIndex, fieldIndex) => {
  const deleted = (((data.dialog_tabs[tabIndex] || {}).dialog_groups || [])[sectionIndex] || {}).dialog_fields;
  const deletedName = deleted && deleted[fieldIndex] && deleted[fieldIndex].name;
  const result = removeFieldAt(data, tabIndex, sectionIndex, fieldIndex);
  return deletedName && !findFieldByName(result, deletedName)
    ? updateFieldResponders(result, deletedName)
    : result;
};

export const deleteSection = (data, tabIndex, sectionIndex) => {
  const tabs = [...data.dialog_tabs];
  const tab = { ...tabs[tabIndex] };
  const groups = [...tab.dialog_groups];

  groups.splice(sectionIndex, 1);
  tab.dialog_groups = groups.map((g, i) => ({ ...g, position: i }));
  tabs[tabIndex] = tab;

  return { ...data, dialog_tabs: tabs };
};

export const deleteTab = (data, tabIndex) => {
  const tabs = [...data.dialog_tabs];
  tabs.splice(tabIndex, 1);
  return { ...data, dialog_tabs: tabs.map((t, i) => ({ ...t, position: i })) };
};

// Default tab/section
export const defaultSection = (position = 0) => ({
  label: __('New Section'),
  description: '',
  position,
  dialog_fields: [],
});

export const defaultTab = (position = 0) => ({
  label: __('New Tab'),
  description: '',
  position,
  dialog_groups: [defaultSection(0)],
});

// Dialog-level save guard
// Save is disabled when:
//   1. no label
//   2. no tabs, or any tab has no label or no groups
//   3. any group has no label or no fields
//   4. two fields share the same name
const tabReason = (tab) => {
  if (!tab.label?.trim()) {
    return __('Every tab needs a label');
  }
  const groups = tab.dialog_groups || [];
  if (groups.length === 0) {
    return sprintf(__('Tab "%s" needs at least one section'), tab.label);
  }
  const unlabelled = groups.some((group) => !group.label?.trim());
  if (unlabelled) {
    return sprintf(__('Every section in tab "%s" needs a label'), tab.label);
  }
  const empty = groups.find((group) => (group.dialog_fields || []).length === 0);
  return empty ? sprintf(__('Section "%s" needs at least one field'), empty.label) : null;
};

// Returns the message for the first failing condition, or null when the dialog can be saved.
export const saveDisabledReason = (data) => {
  if (!data) {
    return __('The dialog has not loaded yet');
  }
  if (!data.label?.trim()) {
    return __('Enter a label for the dialog');
  }
  const tabs = data.dialog_tabs || [];
  if (tabs.length === 0) {
    return __('Add at least one tab');
  }
  const tabProblem = tabs.map(tabReason).find(Boolean);
  if (tabProblem) {
    return tabProblem;
  }
  const duplicate = firstDuplicateFieldName(data);
  return duplicate === undefined ? null : sprintf(__('Field names must be unique, "%s" is used more than once'), duplicate);
};

export const isSaveDisabled = (data) => saveDisabledReason(data) !== null;

// Strip UI-only fields and normalise the field shape before sending to the API
const sanitiseField = (field, position, action) => {
  const {
    // UI-only — strip these
    automation_type: _at,
    dynamicFieldList: _dfl,
    _version: _v,
    // Stale keys that may appear on records loaded from older API responses
    active: _active,
    $$hashKey: _hash,
    href: _href,
    // For copy: id, dialog_group_id are handled at payload level
    ...rest
  } = field;

  // Sanitise resource_action: keep only API-known keys, strip all tree-node
  // and UI-only properties (isBranch, isSelected, element, children, parent,
  // workflow_name, etc.) that come from the automate tree picker selection object.
  // These names are ManageIQ API wire-format keys and cannot be camelCased.
  /* eslint-disable camelcase */
  let { resource_action } = rest;
  if (resource_action) {
    const {
      resource_type,
      ae_attributes,
      ae_namespace,
      ae_class,
      ae_instance,
      configuration_script_id,
      id: ra_id,
    } = resource_action;
    resource_action = {
      ...(resource_type !== undefined ? { resource_type } : {}),
      ...(ae_attributes !== undefined ? { ae_attributes } : {}),
      ...(ae_namespace !== undefined ? { ae_namespace } : {}),
      ...(ae_class !== undefined ? { ae_class } : {}),
      ...(ae_instance !== undefined ? { ae_instance } : {}),
      ...(configuration_script_id !== undefined ? { configuration_script_id } : {}),
      // A copied field is a new record, so it must not point at the original's resource_action row.
      ...(ra_id !== undefined && action !== 'copy' ? { id: ra_id } : {}),
    };
  }
  /* eslint-enable camelcase */

  // For copy action, strip database IDs
  if (action === 'copy') {
    const { id: _id, dialog_group_id: _dgid, ...copyRest } = rest;
    return { ...copyRest, position, resource_action }; // eslint-disable-line camelcase
  }

  return { ...rest, position, resource_action }; // eslint-disable-line camelcase
};

// Build the API payload
// action: 'create' | 'edit'
// id: string (only for edit)
export const buildDialogPayload = (dialogData, action) => {
  const isCopy = action === 'copy';
  const tabs = (dialogData.dialog_tabs || []).map((tab, ti) => ({
    ...(!isCopy && tab.id ? { id: tab.id } : {}),
    label: tab.label,
    description: tab.description || '',
    position: ti,
    dialog_groups: (tab.dialog_groups || []).map((group, gi) => ({
      ...(!isCopy && group.id ? { id: group.id } : {}),
      label: group.label,
      description: group.description || '',
      position: gi,
      dialog_fields: (group.dialog_fields || []).map((field, fi) =>
        sanitiseField(field, fi, action)),
    })),
  }));

  const resource = {
    label: dialogData.label,
    description: dialogData.description || '',
  };

  if (action === 'edit') {
    return {
      action: 'edit',
      resource: {
        ...resource,
        content: { dialog_tabs: tabs },
      },
    };
  }

  // create or copy
  return {
    action: 'create',
    resource: {
      ...resource,
      buttons: 'submit,cancel',
      dialog_tabs: tabs,
    },
  };
};

// Empty dialog template
export const emptyDialog = () => ({
  label: '',
  description: '',
  dialog_tabs: [defaultTab(0)],
});
