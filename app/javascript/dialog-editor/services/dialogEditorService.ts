export default class DialogEditorService {
  public data = {};
  public activeTab = 0;

  /**
   * Store data passed in parameter.
   * @memberof DialogEditorService
   * @function setData
   * @param {any} nested object containing data of the dialog
   */
  public setData(data) {
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
   * @memberof DialogEditorService
   * @function getDialogId
   */
  public getDialogId() {
    return String(this.data.content[0].id || 'new');
  }

  /**
   * Return dialog label loaded at service.
   * @memberof DialogEditorService
   * @function getDialogLabel
   */
  public getDialogLabel() {
    return this.data.content[0].label;
  }

  /**
   * Return dialog description loaded at service.
   * @memberof DialogEditorService
   * @function getDialogDescription
   */
  public getDialogDescription() {
    return this.data.content[0].description;
  }

  /**
   * Return dialog tabs loaded at service.
   * @memberof DialogEditorService
   * @function getDialogTabs
   */
  public getDialogTabs() {
    return this.data.content[0].dialog_tabs;
  }

  public getDynamicFields(nameToExclude) {
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
   * @memberof DialogEditorService
   * @function updatePositions
   * @param {any[]} array of elements to sort
   */
  public updatePositions(elements) {
    elements.forEach((value, key) => value.position = key);
    this.backupSessionStorage(this.getDialogId(), this.data);
  }

  /**
   * Iterates through the list of dialog field names and creates a new
   * unique name for the added element
   * @memberof DialogEditorService
   * @function newFieldName
   */
  public newFieldName(fieldType) {
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

  public clearSessionStorage(id) {
    sessionStorage.removeItem(this.sessionStorageKey(id));
  }

  public backupSessionStorage(id, dialog) {
    sessionStorage.setItem(this.sessionStorageKey(id), JSON.stringify(dialog));
  }

  public restoreSessionStorage(id) {
    return JSON.parse(sessionStorage.getItem(this.sessionStorageKey(id)));
  }

  /**
   * Iterates through all the dialog fields and calls callback method
   * sent through parameter
   * @memberof DialogEditorService
   * @function forEachDialogField
   */
  private forEachDialogField(callback) {
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
   * @memberof DialogEditorService
   * @function anyDialogFields
   */
  private anyDialogFields() {
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
   * @memberof DialogEditorService
   * @function undefinedAttrsToBoolean
   */
  private undefinedAttrsToBoolean() {
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

  private sessionStorageKey(id) {
    return 'service_dialog-' + id;
  }
}
