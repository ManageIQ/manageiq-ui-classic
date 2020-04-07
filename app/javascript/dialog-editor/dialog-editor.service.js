export class DialogEditorService {
  data = {};
  activeTab = 0;

  // store dialog data
  setData(data) {
    this.data = data;
    this.undefinedAttrsToBoolean();

    // FIXME: Compensation of default values until it is been resolved in the API
    this.forEachDialogField((field) => {
      if (field.hasOwnProperty('values') && _.isArray(field.values)) {
        field.values = field.values.filter(value => value[0] && value[1]);
      }
    });
  }

  getDialogId() {
    return String(this.data.content[0].id || 'new');
  }

  getDialogLabel() {
    return this.data.content[0].label;
  }

  getDialogDescription() {
    return this.data.content[0].description;
  }

  getDialogTabs() {
    return this.data.content[0].dialog_tabs;
  }

  getDynamicFields(nameToExclude) {
    let dynamicFields = [];
    this.forEachDialogField((field) => {
      if (nameToExclude && (field.name === nameToExclude)) {
        return;
      }

      if (field.dynamic === true) {
        dynamicFields.push(field);
      }
    });
    return dynamicFields;
  }

  // Update each element's .position to match array index
  updatePositions(elements) {
    elements.forEach((value, key) => value.position = key);
    this.backupSessionStorage(this.getDialogId(), this.data);
  }

  // creates a new unique name for the added element
  newFieldName(fieldType) {
    let dialogFieldNames = [];
    let newOrdinalNumber = 1;
    this.forEachDialogField((field) => {
      dialogFieldNames.push(field.name);
    });
    while (dialogFieldNames.includes(fieldType + '_' + newOrdinalNumber)) {
      newOrdinalNumber++;
    }
    return fieldType + '_' + newOrdinalNumber;
  }

  clearSessionStorage(id) {
    sessionStorage.removeItem(this.sessionStorageKey(id));
  }

  backupSessionStorage(id, dialog) {
    sessionStorage.setItem(this.sessionStorageKey(id), JSON.stringify(dialog));
  }

  restoreSessionStorage(id) {
    return JSON.parse(sessionStorage.getItem(this.sessionStorageKey(id)));
  }

  // Iterates through all the dialog fields and calls callback for each
  forEachDialogField(callback) {
    _.forEach(this.data.content[0].dialog_tabs, (tab) => {
      _.forEach(tab.dialog_groups, (group) => {
        _.forEach(group.dialog_fields, (field) => {
          callback(field);
        });
      });
    });
  }

  // returns true if any dialog fields are present
  anyDialogFields() {
    let ret = false;
    _.forEach(this.data.content[0].dialog_tabs, (tab) => {
      _.forEach(tab.dialog_groups, (group) => {
        if (!_.isEmpty(group.dialog_fields)) {
          ret = true;
        }
      });
    });
    return ret;
  }

  // used to replace undefined values in dialogs with booleans,
  // so that bootstrap switch is not initialized with undefined state
  undefinedAttrsToBoolean() {
    if (!this.anyDialogFields()) {
      return;
    }

    let attributes = [
      'load_values_on_init',
      'read_only',
      'reconfigurable',
      'required',
      'show_refresh_button',
      'visible',
    ];
    let optionalAttributes = [
      'force_multi_value',
      'protected',
      'show_past_days',
    ];

    this.forEachDialogField((field) => {
      attributes.forEach(function(attr) {
        if (field[attr] == null) {
          field[attr] = false;
        }
      });

      if (field['options']) {
        optionalAttributes.forEach(function(attr) {
          if (field['options'][attr] == null) {
            field['options'][attr] = false;
          }
        });
      }
    });
  }

  sessionStorageKey(id) {
    return 'service_dialog-' + id;
  }
}
