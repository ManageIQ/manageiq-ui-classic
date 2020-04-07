import { ModalController } from './modal.controller.js';

// behaviour for the boxes inside of the dialogs tabs.
export const Modal = {
  bindings: {
    elementInfo: '<',
    modalOptions: '<',
    treeOptions: '<',
  },
  controller: ModalController,
  template: '',
  transclude: true,
};
