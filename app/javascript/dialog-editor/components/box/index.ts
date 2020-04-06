import Box from './boxComponent';

export default (module: ng.IModule) => {
  module.component('dialogEditorBoxes', new Box);
};
