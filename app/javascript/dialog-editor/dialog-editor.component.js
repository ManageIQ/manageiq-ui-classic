import { DialogEditorController } from './dialog-editor.controller.js';

// Top-level dialog editor component.
export const DialogEditor = {
  bindings: {
    treeOptions: '<',
  },
  controller: DialogEditorController,
  templateUrl: '/static/dialog-editor/dialog-editor.html',
};
