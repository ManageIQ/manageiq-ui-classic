import ModalBox from './modalBoxComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditorModalBox', new ModalBox);
};
