// ── Action constants ────────────────────────────────────────────────────────
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

// ── Sort helper ─────────────────────────────────────────────────────────────
export const sortItems = (items) =>
  [...items].sort((a, b) => a.position - b.position);

// ── Unique field name validator ──────────────────────────────────────────────
// Returns true if name is already used by another field in the dialog
export const uniqueNameValidator = (dialogData, currentField) => {
  const allFields = getAllFields(dialogData);
  return allFields.some((f) => f.name === currentField.name && f !== currentField);
};

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

// ── Reorder / immutable array helpers ────────────────────────────────────────
const moveItem = (arr, fromIndex, toIndex) => {
  const result = [...arr];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((item, index) => ({ ...item, position: index }));
};

// ── Drop handlers ─────────────────────────────────────────────────────────────

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

// ── Refresh-enabled fields ────────────────────────────────────────────────────
// Returns all dynamic fields excluding the one with name=excludeName
export const getRefreshEnabledFields = (data, excludeName) => {
  const fields = getAllFields(data);
  return fields.filter((f) => f.dynamic && f.name !== excludeName);
};

// ── componentId → field type mapping ────────────────────────────────────────
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

// ── Field values normalisation ────────────────────────────────────────────────
// Converts angular [[value, description], ...] wire format to/from objects
export const getFieldValues = (field) => {
  if (!Array.isArray(field.values)) return [];
  return field.values.map((v) => {
    if (Array.isArray(v)) return { value: v[0], description: v[1] };
    return v;
  });
};

export const fieldValuesToArray = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map((v) => {
    if (Array.isArray(v)) return v;
    return [v.value, v.description];
  });
};

// ── Current time helper for DateTimePicker ────────────────────────────────────
export const getCurrentTimeAndPeriod = () => {
  const now = new Date();
  const hours = now.getHours();
  return {
    hour: String(hours % 12 || 12).padStart(2, '0'),
    minute: String(now.getMinutes()).padStart(2, '0'),
    period: hours < 12 ? 'AM' : 'PM',
  };
};

// ── Properties edit (immutable update) ───────────────────────────────────────
// Merges updatedProps into the target field identified by fieldName
export const handlePropertiesEdit = (data, fieldName, updatedProps) => {
  const tabs = data.dialog_tabs.map((tab) => ({
    ...tab,
    dialog_groups: (tab.dialog_groups || []).map((group) => ({
      ...group,
      dialog_fields: (group.dialog_fields || []).map((field) => {
        if (field.name !== fieldName) return field;
        return { ...field, ...updatedProps, _version: (field._version || 1) + 1 };
      }),
    })),
  }));
  return { ...data, dialog_tabs: tabs };
};

// ── Delete helpers ────────────────────────────────────────────────────────────
export const deleteField = (data, tabIndex, sectionIndex, fieldIndex) => {
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

// ── Default tab/section ───────────────────────────────────────────────────────
export const defaultTab = (position = 0) => ({
  label: __('New Tab'),
  description: '',
  position,
  dialog_groups: [defaultSection(0)],
});

export const defaultSection = (position = 0) => ({
  label: __('New Section'),
  description: '',
  position,
  dialog_fields: [],
});

// ── Build the API payload ─────────────────────────────────────────────────────
// action: 'create' | 'edit'
// id: string (only for edit)
export const buildDialogPayload = (dialogData, action) => {
  const tabs = (dialogData.dialog_tabs || []).map((tab, ti) => ({
    ...(tab.id ? { id: tab.id } : {}),
    label: tab.label,
    description: tab.description || '',
    position: ti,
    dialog_groups: (tab.dialog_groups || []).map((group, gi) => ({
      ...(group.id ? { id: group.id } : {}),
      label: group.label,
      description: group.description || '',
      position: gi,
      dialog_fields: (group.dialog_fields || []).map((field, fi) =>
        sanitiseField(field, fi, action)
      ),
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

// Strip UI-only fields and normalise data types to match Angular wire format
const sanitiseField = (field, position, action) => {
  const {
    // UI-only — strip these
    automation_type: _at,
    dynamicFieldList: _dfl,
    _version: _v,
    // angular internals (strip if present)
    active: _active,
    $$hashKey: _hash,
    href: _href,
    // For copy: id, dialog_group_id are handled at payload level
    ...rest
  } = field;

  // Strip workflow_name from resource_action (UI-only)
  let resource_action = rest.resource_action;
  if (resource_action) {
    const { workflow_name: _wn, ...cleanRa } = resource_action;
    resource_action = cleanRa;
  }

  // For copy action, strip database IDs
  if (action === 'copy') {
    const { id: _id, dialog_group_id: _dgid, ...copyRest } = rest;
    return { ...copyRest, position, resource_action };
  }

  return { ...rest, position, resource_action };
};

// ── Empty dialog template ─────────────────────────────────────────────────────
export const emptyDialog = () => ({
  label: '',
  description: '',
  dialog_tabs: [defaultTab(0)],
});
