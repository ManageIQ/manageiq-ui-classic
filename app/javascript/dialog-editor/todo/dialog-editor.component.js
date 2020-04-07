class DialogEditorController {
  setupModalOptions(type, tab, box, field) {
    const components = {
      tab: 'dialog-editor-modal-tab',
      box: 'dialog-editor-modal-box',
      field: 'dialog-editor-modal-field',
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

// Top-level dialog editor component.
export const DialogEditor = {
  bindings: {
    treeOptions: '<',
  },
  controller: DialogEditorController,
  template: require('./dialog-editor.html'),
};
