import { FieldController } from './field.controller.js';

// behaviour for the fields inside of the dialogs boxes
export const Field = {
  bindings: {
    boxPosition: '<',
    fieldData: '<',
    setupModalOptions: '&',
  },
  controller: FieldController,
  controllerAs: 'vm',
  templateUrl: '/static/dialog-editor/field.html',
};
