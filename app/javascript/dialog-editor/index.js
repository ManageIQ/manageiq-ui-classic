import { ModalBox } from './modal-box.component.js';
import { ModalField } from './modal-field.component.js';
import { ModalTab } from './modal-tab.component.js';

import './styles/index.scss';


angular.module('miq.dialogEditor', [
  'frapontillo.bootstrap-switch',
  'miqStaticAssets.miqSelect',
  'ngDragDrop',
  'ui.sortable',
])
  .component('dialogEditor', new DialogEditor)
  .component('dialogEditorBoxes', new Box)
  .component('dialogEditorField', new Field)
  .component('dialogEditorFieldStatic', new Toolbox)
  .component('dialogEditorModal', new Modal)
  .component('dialogEditorModalBox', ModalBox)
  .component('dialogEditorModalField', ModalField)
  .component('dialogEditorModalFieldTemplate', new ModalFieldTemplate)
  .component('dialogEditorModalTab', ModalTab)
  .component('dialogEditorTabs', new TabList)
  .component('dialogEditorTreeSelector', TreeSelector)
  .component('dialogEditorValidation', Validation)
  .service('DialogEditor', DialogEditorService)
  .service('DialogValidation', DialogValidationService)
;

//TODO fix imports and names, and files

// components/box/index.ts
import Box from './box.component.js';

// components/dialog-editor/index.ts
import DialogEditor from './dialogEditor.component.js';

// components/field/index.ts
import Field from './field.component.js';

// components/modal/index.ts
import Modal from './modal.component.js';

// components/modal-field-template/index.ts
import ModalFieldTemplate from './modalFieldTemplate.component.js';

// components/tab-list/index.ts
import TabList from './tabList.component.js';

// components/toolbox/index.ts
import Toolbox from './toolbox.component.js';

// components/tree-selector/index.ts
import TreeSelector from './treeSelector';

// components/validation/index.ts
import Validation from './validation';

// services/index.ts
import DialogEditorService from './dialogEditorService';
import DialogValidationService from './dialogValidationService';
