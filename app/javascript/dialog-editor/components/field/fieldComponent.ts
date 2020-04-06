/**
 * Controller for the Dialog Editor field component
 * @memberof miqStaticAssets
 * @ngdoc controller
 * @name FieldController
 */
class FieldController {
  public service;
  public fieldData;
  public boxPosition;

  constructor(DialogEditor) {
    this.DialogEditor = DialogEditor;
  }

  /**
   * Load service to be able to access it form the template.
   * @memberof FieldController
   * @function $onInit
   */
  public $onInit() {
    this.service = this.DialogEditor;
  }

  /**
   * Remove Field
   * @memberof FieldController
   * @function remmoveField
   * @param {number} tabId is an index of tab, where the box is placed
   * @param {number} boxId is an index of box, where the field is placed
   * @param {number} fieldId is an index of field
   */
  public removeField(tabId, boxId, fieldId) {
    _.remove(this.getFields(tabId, boxId), (field) => field.position === fieldId);
    this.DialogEditor.updatePositions(this.getFields(tabId, boxId));
  }

  /**
   * Convert default value for multiple select fields to an array
   * @memberof FieldController
   * @function convertValuesToArray
   */
  public convertValuesToArray() {
    this.fieldData.default_value = angular.fromJson(this.fieldData.default_value);
  }

  /**
   * Find fields at tabId and boxId.
   * @memberof FieldController
   * @function getFields
   * @param {number} tabId is an index of tab, where the box is placed
   * @param {number} boxId is an index of box, where the field is placed
   * @returns {Array} of fields.
   */
  private getFields(tabId, boxId) {
    const tabs = this.DialogEditor.getDialogTabs();
    return tabs[tabId].dialog_groups[boxId].dialog_fields;
  }
}

FieldController.$inject = ['DialogEditor'];

/**
 * @memberof miqStaticAssets
 * @ngdoc component
 * @name dialogEditorField
 * @description
 *    Component implementing behaviour for the fields inside of
 *    the dialogs boxes.
 * @example
 * <dialog-editor-field box-position="box.position"
 *                      field-data='field'
 * </dialog-editor-field>
 */
export default class Field {
  public template = require('./field.html');
  public controller = FieldController;
  public controllerAs = 'vm';
  public bindings = {
    fieldData: '<',
    boxPosition: '<',
    setupModalOptions: '&'
  };
}
