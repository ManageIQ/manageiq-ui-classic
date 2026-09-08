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

// ── Date helpers for DatePicker / DateTimePicker canvas widgets ───────────────
//
// Carbon's DatePicker (flatpickr) expects value as [Date] — not a raw string.
// Parse date parts directly to avoid UTC→local timezone shift (off-by-one bug).
// Handles both formats:
//   'YYYY-MM-DD' / 'YYYY-MM-DDT...' — React/API format
//   'MM/dd/yyyy'                     — legacy format stored by Angular
//
// For DateTimeControl, default_value is stored as a combined string: 'YYYY-MM-DD HH:MM'
// (React) or 'MM/dd/yyyy HH:MM' (Angular legacy). The date and time portions are
// separated by a space. isoToDatePickerValue always operates on the date portion only.

export const isoToDatePickerValue = (iso) => {
  if (!iso) return [];
  // Strip any time portion before parsing the date
  const datePart = iso.split(' ')[0];
  // Angular legacy format: 'MM/dd/yyyy'
  if (datePart.includes('/')) {
    const [mo, dy, yr] = datePart.split('/').map(Number);
    if (mo && dy && yr) return [new Date(yr, mo - 1, dy)];
    return [];
  }
  // ISO format: 'YYYY-MM-DD' or 'YYYY-MM-DDThh:mm:ssZ'
  const [y, m, d] = datePart.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return [];
  return [new Date(y, m - 1, d)];
};

// Extract the time string ('HH:MM') from a DateTime default_value, or '' if absent.
export const extractTimeFromDateTime = (value) => {
  if (!value || typeof value !== 'string') return '';
  const parts = value.split(' ');
  return parts.length >= 2 ? parts[1] : '';
};

// Combine a 'YYYY-MM-DD' date string and 'HH:MM' time string into 'YYYY-MM-DD HH:MM'.
// If no time is provided, returns the date string alone.
export const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr) return '';
  if (!timeStr) return dateStr;
  return `${dateStr} ${timeStr}`;
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

  // Sanitise resource_action: keep only API-known keys, strip all tree-node
  // and UI-only properties (isBranch, isSelected, element, children, parent,
  // workflow_name, etc.) that come from the automate tree picker selection object.
  let resource_action = rest.resource_action;
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
      ...(ra_id !== undefined ? { id: ra_id } : {}),
    };
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
