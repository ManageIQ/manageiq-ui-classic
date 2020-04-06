import { ModalBox } from './modal-box.component.js';
import { ModalField } from './modal-field.component.js';
import { ModalTab } from './modal-tab.component.js';

export default (module) => (module
  .component('dialogEditorModalBox', ModalBox)
  .component('dialogEditorModalField', ModalField)
  .component('dialogEditorModalTab', ModalTab)
);
