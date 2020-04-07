import { MiqDialogEditorController } from './miq-dialog-editor.controller.js';

// Top-top-level dialog editor component.
export const MiqDialogEditor = {
  bindings: {
    dialogId: '@',
    dialogAction: '@',
  },
  controller: MiqDialogEditorController,
  controllerAs: 'vm',
  template: require('./miq-dialog-editor.html.haml'),
};
