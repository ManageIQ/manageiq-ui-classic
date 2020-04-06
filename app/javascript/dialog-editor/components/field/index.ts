import Field from './fieldComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditorField', new Field);
};
