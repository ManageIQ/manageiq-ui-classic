import DialogEditor from './dialogEditorComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditor', new DialogEditor);
};
