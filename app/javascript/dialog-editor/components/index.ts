import box from './box';
import dialogEditor from './dialog-editor';
import field from './field';
import modal from './modal';
import modalBox from './modal-box';
import modalField from './modal-field';
import modalFieldTemplate from './modal-field-template';
import modalTab from './modal-tab';
import tabList from './tab-list';
import toolbox from './toolbox';
import treeSelector from './tree-selector';
import validation from './validation';

export default (module: ng.IModule) => {
  box(module);
  dialogEditor(module);
  field(module);
  modal(module);
  modalBox(module);
  modalField(module);
  modalFieldTemplate(module);
  modalTab(module);
  tabList(module);
  toolbox(module);
  treeSelector(module);
  validation(module);
};
