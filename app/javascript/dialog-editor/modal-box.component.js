import { ModalShared } from './modal-shared.component.js';
import { ModalSharedController } from './modal-shared.controller.js';

// body of the edit *box* modal
export const ModalBox = {
  ...ModalShared,
  controller: ModalSharedController,
  template: require('./modal-box.html'),
};
