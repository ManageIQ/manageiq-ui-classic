import { Boxes } from './boxes.component.js';
import { DialogEditor } from './dialog-editor.component.js';
import { DialogEditorHttpService } from './dialog-editor-http.service.js';
import { DialogEditorService } from './dialog-editor.service.js';
import { DialogValidationService } from './dialog-validation.service.js';
import { Field } from './field.component.js';
import { MiqDialogEditor } from './miq-dialog-editor.component.js';
import { Modal } from './modal.component.js';
import { ModalBox } from './modal-box.component.js';
import { ModalField } from './modal-field.component.js';
import { ModalFieldTemplate } from './modal-field-template.component.js';
import { ModalTab } from './modal-tab.component.js';
import { Tabs } from './tabs.component.js';
import { Toolbox } from './toolbox.component.js';
import { TreeSelector } from './tree-selector.component.js';
import { Validation } from './validation.component.js';

import './styles/index.scss';

angular.module('miq.dialogEditor', [
  'frapontillo.bootstrap-switch',
  'miqStaticAssets.miqSelect',
  'ngDragDrop',
  'ui.sortable',
])
  .component('dialogEditor', DialogEditor)
  .component('dialogEditorBoxes', Boxes)
  .component('dialogEditorField', Field)
  .component('dialogEditorModal', Modal)
  .component('dialogEditorModalBox', ModalBox)
  .component('dialogEditorModalField', ModalField)
  .component('dialogEditorModalFieldTemplate', ModalFieldTemplate)
  .component('dialogEditorModalTab', ModalTab)
  .component('dialogEditorTabs', Tabs)
  .component('dialogEditorToolbox', Toolbox)
  .component('dialogEditorTreeSelector', TreeSelector)
  .component('dialogEditorValidation', Validation)
  .component('miqDialogEditor', MiqDialogEditor)
  .service('DialogEditor', DialogEditorService)
  .service('DialogEditorHttp', DialogEditorHttpService)
  .service('DialogValidation', DialogValidationService)
;
