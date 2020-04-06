import box from './box';
import dialogEditor from './dialog-editor';
import field from './field';
import modal from './modal';
import modalFieldTemplate from './modal-field-template';
import tabList from './tab-list';
import toolbox from './toolbox';
import treeSelector from './tree-selector';
import validation from './validation';

export default (module) => {
  box(module);
  dialogEditor(module);
  field(module);
  modal(module);
  modalFieldTemplate(module);
  tabList(module);
  toolbox(module);
  treeSelector(module);
  validation(module);
};
