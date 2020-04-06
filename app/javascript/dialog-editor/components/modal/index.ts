import Modal from './modalComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditorModal', new Modal);
};
