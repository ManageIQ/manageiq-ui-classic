import { DialogEditorController } from './dialog-editor.controller.js';

// Top-level dialog editor component.
export const DialogEditor = {
  bindings: {
    treeOptions: '<',
  },
  controller: DialogEditorController,
  template: require('./dialog-editor.html'),
};
