import { BoxesController } from './boxes.controller.js';

// behaviour for the boxes inside of the dialogs tabs.
export const Boxes = {
  bindings: {
    setupModalOptions: '&',
  },
  controller: BoxesController,
  controllerAs: 'vm',
  templateUrl: '/static/dialog-editor/boxes.html',
};
