import Validation from './validation';

export default (module: ng.IModule) => {
  module.component('dialogEditorValidation', Validation);
};
