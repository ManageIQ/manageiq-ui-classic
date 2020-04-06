export default class DialogEditorService {
  data = {};
  activeTab = 0;

  /**
   * Store data passed in parameter.
   * @param {any} nested object containing data of the dialog
   */
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

  /**
   * Return dialog id loaded at service.
   */
  getDialogId() {
    return String(this.data.content[0].id || 'new');
  }

  /**
   * Return dialog label loaded at service.
   */
  getDialogLabel() {
    return this.data.content[0].label;
  }

  /**
   * Return dialog description loaded at service.
   */
  getDialogDescription() {
    return this.data.content[0].description;
  }

  /**
   * Return dialog tabs loaded at service.
   */
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

  /**
   * Update positions for elements in array.
   * @param {any[]} array of elements to sort
   */
  updatePositions(elements) {
    elements.forEach((value, key) => value.position = key);
    this.backupSessionStorage(this.getDialogId(), this.data);
  }

  /**
   * Iterates through the list of dialog field names and creates a new
   * unique name for the added element
   */
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

  /**
   * Iterates through all the dialog fields and calls callback method
   * sent through parameter
   */
  forEachDialogField(callback) {
    _.forEach(this.data.content[0].dialog_tabs, (tab) => {
      _.forEach(tab.dialog_groups, (group) => {
        _.forEach(group.dialog_fields, (field) => {
          callback(field);
        });
      });
    });
  }

  /**
   * Function iterates through all the groups in the dialog editor
   * and returns true if any dialog fields are present
   */
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

  /**
   * Function is used to replace undefined values in dialogs
   * with boolean, so the bootstrap switch is not initialized with
   * undefined state
   */
  undefinedAttrsToBoolean() {
    if (!this.anyDialogFields()) {
      return;
    }

    let attributes = [
      'required', 'visible', 'read_only', 'show_refresh_button',
      'load_values_on_init', 'reconfigurable',
    ];
    let optionalAttributes = [
      'show_past_days', 'protected', 'force_multi_value'
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
