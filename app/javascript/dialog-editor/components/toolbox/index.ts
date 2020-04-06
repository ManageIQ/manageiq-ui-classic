import Toolbox from './toolboxComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditorFieldStatic', new Toolbox);
};
