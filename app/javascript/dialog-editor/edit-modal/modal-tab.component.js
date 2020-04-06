import { ModalShared } from './modal-shared.component.js';
import { ModalSharedController } from './modal-shared.controller.js';

// body of the edit *tab* modal
export default const ModalTab = {
  ...ModalShared,
  controller: ModalSharedController,
  template: require('./modal-tab.html'),
};
