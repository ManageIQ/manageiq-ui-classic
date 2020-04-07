/**
 * Controller for the Dialog Editor field component
 */
class FieldController {
  constructor(DialogEditor) {
    this.DialogEditor = DialogEditor;
  }

  /**
   * Load service to be able to access it form the template.
   */
  $onInit() {
    this.service = this.DialogEditor;
  }

  /**
   * Remove Field
   * @param {number} tabId is an index of tab, where the box is placed
   * @param {number} boxId is an index of box, where the field is placed
   * @param {number} fieldId is an index of field
   */
  removeField(tabId, boxId, fieldId) {
    _.remove(this.getFields(tabId, boxId), (field) => field.position === fieldId);
    this.DialogEditor.updatePositions(this.getFields(tabId, boxId));
  }

  /**
   * Convert default value for multiple select fields to an array
   */
  convertValuesToArray() {
    this.fieldData.default_value = angular.fromJson(this.fieldData.default_value);
  }

  /**
   * Find fields at tabId and boxId.
   * @param {number} tabId is an index of tab, where the box is placed
   * @param {number} boxId is an index of box, where the field is placed
   * @returns {Array} of fields.
   */
  getFields(tabId, boxId) {
    const tabs = this.DialogEditor.getDialogTabs();
    return tabs[tabId].dialog_groups[boxId].dialog_fields;
  }
}

FieldController.$inject = ['DialogEditor'];

/**
 * @description
 *    Component implementing behaviour for the fields inside of
 *    the dialogs boxes.
 * @example
 * <dialog-editor-field box-position="box.position"
 *                      field-data='field'
 * </dialog-editor-field>
 */
export default class Field {
  template = require('./field.html');
  controller = FieldController;
  controllerAs = 'vm';
  bindings = {
    fieldData: '<',
    boxPosition: '<',
    setupModalOptions: '&',
  };
}
