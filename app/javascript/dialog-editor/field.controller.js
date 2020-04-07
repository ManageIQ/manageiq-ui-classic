export class FieldController {
  constructor(DialogEditor) {
    this.DialogEditor = DialogEditor;
  }

  // Load service to be able to access it from the template.
  $onInit() {
    this.service = this.DialogEditor;
  }

  // remove field
  removeField(tabId, boxId, fieldId) {
    _.remove(this.getFields(tabId, boxId), (field) => field.position === fieldId);
    this.DialogEditor.updatePositions(this.getFields(tabId, boxId));
  }

  // Convert default value for multiple select fields to an array
  convertValuesToArray() {
    this.fieldData.default_value = angular.fromJson(this.fieldData.default_value);
  }

  // Return array of fields at tabId and boxId.
  getFields(tabId, boxId) {
    const tabs = this.DialogEditor.getDialogTabs();
    return tabs[tabId].dialog_groups[boxId].dialog_fields;
  }
}

FieldController.$inject = ['DialogEditor'];
