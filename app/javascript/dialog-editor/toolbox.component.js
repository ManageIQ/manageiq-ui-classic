import { ToolboxController } from './toolbox.controller.js';

// used as a toolbox for the Dialog Editor
export const Toolbox = {
  controller: ToolboxController,
  controllerAs: 'vm',
  template: require('./toolbox.html'),
};
