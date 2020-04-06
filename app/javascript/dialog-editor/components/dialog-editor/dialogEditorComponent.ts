export class DialogEditorController {
  modalOptions;
  elementInfo;
  treeOptions;

  setupModalOptions(type, tab, box, field) {
    const components = {
      tab: 'dialog-editor-modal-tab',
      box: 'dialog-editor-modal-box',
      field: 'dialog-editor-modal-field'
    };

    this.modalOptions = {
      component: components[type],
      size: 'lg',
    };

    this.elementInfo = {
      type,
      tabId: tab,
      boxId: box,
      fieldId: field,
    };
  }
}

/**
 * @memberof miqStaticAssets
 * @ngdoc component
 * @name dialogEditor
 * @description
 *    Top-level dialog editor component.
 * @example
 * <dialog-editor>
 * </dialog-editor>
 */

export default class DialogEditor implements ng.IComponentOptions {
  controller = DialogEditorController;
  template = require('./dialog-editor.html');
  bindings = {
    treeOptions: '<',
  };
}
