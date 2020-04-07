import { ModalShared } from './modal-shared.component.js';
import { ModalFieldController } from './modal-field.controller.js';

// body of the edit *field* modal
export const ModalField = {
  ...ModalShared,
  controller: ModalFieldController,
  template: require('./modal-field.html'),
};
